"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useTheme } from "./dashboard/hooks/useTheme";
import { useMediaQuery } from "./dashboard/hooks/useMediaQuery";
import { useSettings } from "./dashboard/hooks/useSettings";
import { useLeads } from "./dashboard/hooks/useLeads";
import { NEON_THEME } from "@/lib/dashboard/constants";
import { pageTransition } from "@/lib/animations";
import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardOverview from "./dashboard/DashboardOverview";
import LeadsView from "./dashboard/LeadsView";
import SplashScreen from "./ui/SplashScreen";
import AnimatedToast from "./ui/AnimatedToast";
import { SkeletonCard } from "./ui/Skeleton";

// ── Lazy loading de vistas pesadas: solo se descargan al abrir su tab ──
const BulkEmail = dynamic(() => import("./dashboard/features/BulkEmail"), {
  loading: () => <SkeletonCard lines={5} />,
});
const BulkWhatsApp = dynamic(() => import("./dashboard/features/BulkWhatsApp"), {
  loading: () => <SkeletonCard lines={5} />,
});
const ImportData = dynamic(() => import("./dashboard/features/ImportData"), {
  loading: () => <SkeletonCard lines={6} />,
});
const UserManager = dynamic(() => import("./dashboard/features/UserManager"), {
  loading: () => <SkeletonCard lines={6} />,
});
const SettingsForm = dynamic(() => import("./dashboard/features/SettingsForm"), {
  loading: () => <SkeletonCard lines={6} />,
});
const LandingEditor = dynamic(() => import("./dashboard/features/LandingEditor"), {
  loading: () => <SkeletonCard lines={7} />,
});
const B2BLandingEditor = dynamic(() => import("./dashboard/features/B2BLandingEditor"), {
  loading: () => <SkeletonCard lines={5} />,
});
const LandingManager = dynamic(() => import("./dashboard/features/LandingManager"), {
  loading: () => <SkeletonCard lines={6} />,
});
const Billing = dynamic(() => import("./dashboard/features/Billing"), {
  loading: () => <SkeletonCard lines={4} />,
});

function getPageTitle(activeMenu, isAdmin) {
  const map = {
    dashboard: "Dashboard",
    leads: isAdmin ? "Mis Prospectos" : "Clientes",
    emails: "Correos",
    whatsapp: "WhatsApp",
    import: "Importar Datos",
    users: isAdmin ? "Clientes" : "Usuarios",
    settings: "Configuración",
    landing: "Editor de Landing",
    billing: "Facturación",
    landings: "Landings por Compañía",
  };
  return map[activeMenu] || activeMenu;
}

const VALID_MENU_IDS = ["dashboard", "leads", "emails", "whatsapp", "import", "users", "settings", "landing", "billing", "landings"];

const SPLASH_DURATION = 1700; // ms — sincronizado con la barra de progreso del splash

export default function DashboardClient({ initialLeads = [], initialTotal = 0, initialStats = null, username, isAdmin = false, sellerSlug = null, sellerInfo = null, lockedToBilling = false }) {
  const { theme, setTheme, toggle: toggleTheme } = useTheme();
  const T = NEON_THEME[theme];

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const searchParams = useSearchParams();

  // Splash: visible al montar (cada ingreso al dashboard), sale con fade + scale
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const [activeMenu, setActiveMenu] = useState(() => {
    if (lockedToBilling) return "billing";
    const tab = searchParams.get("tab");
    return VALID_MENU_IDS.includes(tab) ? tab : "dashboard";
  });
  // Sidebar: null = usar valor por defecto según viewport; true/false = preferencia del usuario
  const [sidebarOpen, setSidebarOpen] = useState(null);
  const effectiveSidebarOpen = sidebarOpen ?? !isMobile;

  const [updating, setUpdating] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const {
    settings,
    toast,
    updateSettings,
    saveSettings,
    showToast,
  } = useSettings({ isAdmin });

  const onboardingNeeded = !isAdmin && !lockedToBilling && (!sellerInfo?.photo || !sellerInfo?.bio || !sellerInfo?.phone);

  const {
    leads,
    total,
    page,
    totalPages,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    goToPage,
    refresh,
    updateLead,
    removeLead,
    loading: leadsLoading,
  } = useLeads(initialLeads, initialTotal);

  // Toggle tema que también persiste en DB
  const handleToggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Guardar en DB
    if (isAdmin) {
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboard_theme: newTheme }),
      }).catch(() => {});
    } else {
      // Para sellers: guardar en DB via updateSettings
      updateSettings({ dashboardTheme: newTheme });
      saveSettings({ ...settings, dashboardTheme: newTheme }).catch(() => {});
    }
  }, [theme, setTheme, isAdmin, settings, updateSettings, saveSettings]);

  const handleMenuChange = useCallback((menuId) => {
    // Cuenta pausada: solo se permite navegar a Facturación.
    if (lockedToBilling && menuId !== "billing") return;
    setActiveMenu(menuId);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, lockedToBilling]);

  const handleUpdateStatus = useCallback(async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updateLead(updated);
      showToast("Estado actualizado correctamente");
    } catch {
      alert("Error al actualizar estado");
    } finally {
      setUpdating(null);
    }
  }, [updateLead, showToast]);

  const handleImportSuccess = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleDeleteLead = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al eliminar lead");
      removeLead(id);
      showToast("Lead eliminado correctamente");
    } catch (err) {
      showToast(err.message || "Error al eliminar lead");
    }
  }, [removeLead, showToast]);

  const handleSaveSettings = useCallback(async (settingsToSave) => {
    const ok = await saveSettings(settingsToSave);
    if (ok && typeof window !== "undefined") {
      if (settingsToSave.landingTheme) {
        document.documentElement.setAttribute("data-landing-theme", settingsToSave.landingTheme);
      }
      if (settingsToSave.dashboardTheme) {
        setTheme(settingsToSave.dashboardTheme);
      }
    }
  }, [saveSettings, setTheme]);

  // Sincronizar tema del dashboard desde settings cargadas
  useEffect(() => {
    if (settings.dashboardTheme && settings.dashboardTheme !== theme) {
      setTheme(settings.dashboardTheme);
    }
  }, [settings.dashboardTheme, theme, setTheme]);

  useEffect(() => {
    if (isAdmin) return undefined;

    let cancelled = false;

    async function loadSubscription() {
      try {
        const res = await fetch("/api/subscription");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSubscription(data);
      } catch {
        // noop
      }
    }

    loadSubscription();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, activeMenu]);

  useEffect(() => {
    if (isAdmin) return;
    if (!subscription?.isExpired) return;
    if (activeMenu === "billing") return;

    const timer = setTimeout(() => {
      setActiveMenu("billing");
    }, 0);

    return () => clearTimeout(timer);
  }, [isAdmin, subscription?.isExpired, activeMenu]);

  return (
    <MotionConfig reducedMotion="user">
      {/* Splash de ingreso (fade + scale de salida) */}
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <DashboardLayout
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        sidebarOpen={effectiveSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        T={T}
        theme={theme}
        toggleTheme={handleToggleTheme}
        sellerName={sellerInfo?.name || username}
        username={username}
        company={sellerInfo?.company || null}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customDate={customDate}
        setCustomDate={setCustomDate}
        isMobile={isMobile}
        pageTitle={getPageTitle(activeMenu, isAdmin)}
        isAdmin={isAdmin}
        sellerSlug={sellerSlug}
        onboardingNeeded={onboardingNeeded}
        lockedToBilling={lockedToBilling}
      >
        {/* Transición suave entre vistas (fade + slide) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Suspense fallback={<SkeletonCard lines={5} />}>
              {activeMenu === "dashboard" && (
                <DashboardOverview
                  filters={{ search, statusFilter, dateFilter, customDate }}
                  initialStats={initialStats}
                  T={T}
                  isMobile={isMobile}
                  isAdmin={isAdmin}
                  subscription={subscription}
                  onViewAllLeads={() => setActiveMenu("leads")}
                  onViewClients={() => setActiveMenu("users")}
                  onOpenBilling={() => setActiveMenu("billing")}
                />
              )}

              {activeMenu === "leads" && (
                <LeadsView
                  leads={leads}
                  total={total}
                  page={page}
                  totalPages={totalPages}
                  search={search}
                  setSearch={setSearch}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onPageChange={goToPage}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteLead={handleDeleteLead}
                  updating={updating}
                  loading={leadsLoading}
                  T={T}
                  isMobile={isMobile || isTablet}
                  isAdmin={isAdmin}
                  showToast={showToast}
                />
              )}

              {activeMenu === "emails" && (
                <BulkEmail
                  leads={leads}
                  T={T}
                  isMobile={isMobile}
                  sellerName={sellerInfo?.name || settings.sellerName || username}
                  showToast={showToast}
                  isAdmin={isAdmin}
                />
              )}

              {activeMenu === "whatsapp" && (
                <BulkWhatsApp
                  leads={leads}
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
                  defaultMessage={settings.sellerMsg}
                  isAdmin={isAdmin}
                />
              )}

              {activeMenu === "import" && (
                <ImportData
                  leads={leads}
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
                  onImportSuccess={handleImportSuccess}
                />
              )}

              {activeMenu === "users" && (
                <UserManager
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
                />
              )}

              {activeMenu === "settings" && (
                <SettingsForm
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  onSaveSettings={handleSaveSettings}
                  T={T}
                  theme={theme}
                  setTheme={setTheme}
                  toggleTheme={handleToggleTheme}
                  isMobile={isMobile}
                  showToast={showToast}
                  isAdmin={isAdmin}
                />
              )}

              {activeMenu === "landing" && (
                isAdmin ? (
                  <B2BLandingEditor
                    T={T}
                    isMobile={isMobile}
                    showToast={showToast}
                  />
                ) : (
                  <LandingEditor
                    sellerInfo={sellerInfo}
                    T={T}
                    isMobile={isMobile}
                    showToast={showToast}
                  />
                )
              )}

              {activeMenu === "billing" && !isAdmin && (
                <Billing
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
                  locked={lockedToBilling}
                />
              )}

              {activeMenu === "landings" && (
                <LandingManager
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>

        {/* Toast animado con resorte */}
        <AnimatedToast message={toast} T={T} isMobile={isMobile} />
      </DashboardLayout>
    </MotionConfig>
  );
}
