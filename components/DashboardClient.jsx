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
const LandingManager = dynamic(() => import("./dashboard/features/LandingManager"), {
  loading: () => <SkeletonCard lines={6} />,
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
    landings: "Landings por Compañía",
  };
  return map[activeMenu] || activeMenu;
}

const VALID_MENU_IDS = ["dashboard", "leads", "emails", "whatsapp", "import", "users", "settings", "landing", "landings"];

const SPLASH_DURATION = 1700; // ms — sincronizado con la barra de progreso del splash

export default function DashboardClient({ initialLeads = [], initialTotal = 0, initialStats = null, username, isAdmin = false, sellerSlug = null, sellerInfo = null }) {
  const { theme, toggle: toggleTheme } = useTheme();
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
    const tab = searchParams.get("tab");
    return VALID_MENU_IDS.includes(tab) ? tab : "dashboard";
  });
  // Sidebar: null = usar valor por defecto según viewport; true/false = preferencia del usuario
  const [sidebarOpen, setSidebarOpen] = useState(null);
  const effectiveSidebarOpen = sidebarOpen ?? !isMobile;

  const [updating, setUpdating] = useState(null);

  const {
    settings,
    toast,
    updateSettings,
    saveSettings,
    showToast,
  } = useSettings({ isAdmin });

  const onboardingNeeded = !isAdmin && (!sellerInfo?.photo || !sellerInfo?.bio || !sellerInfo?.phone);

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
    loading: leadsLoading,
  } = useLeads(initialLeads, initialTotal);

  const handleMenuChange = useCallback((menuId) => {
    setActiveMenu(menuId);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

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

  const handleSaveSettings = useCallback(async (settingsToSave) => {
    const ok = await saveSettings(settingsToSave);
    if (ok && typeof window !== "undefined" && settingsToSave.landingTheme) {
      document.documentElement.setAttribute("data-landing-theme", settingsToSave.landingTheme);
    }
  }, [saveSettings]);

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
        toggleTheme={toggleTheme}
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
                  onViewAllLeads={() => setActiveMenu("leads")}
                  onViewClients={() => setActiveMenu("users")}
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
                />
              )}

              {activeMenu === "whatsapp" && (
                <BulkWhatsApp
                  leads={leads}
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
                  defaultMessage={settings.sellerMsg}
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
                  isMobile={isMobile}
                  showToast={showToast}
                  isAdmin={isAdmin}
                />
              )}

              {activeMenu === "landing" && (
                <LandingEditor
                  sellerInfo={sellerInfo}
                  T={T}
                  isMobile={isMobile}
                  showToast={showToast}
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
