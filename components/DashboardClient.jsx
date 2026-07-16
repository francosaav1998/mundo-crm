"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "./dashboard/hooks/useTheme";
import { useMediaQuery } from "./dashboard/hooks/useMediaQuery";
import { useSettings } from "./dashboard/hooks/useSettings";
import { useLeads } from "./dashboard/hooks/useLeads";
import { NEON_THEME } from "@/lib/dashboard/constants";
import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardOverview from "./dashboard/DashboardOverview";
import LeadsView from "./dashboard/LeadsView";
import BulkEmail from "./dashboard/features/BulkEmail";
import BulkWhatsApp from "./dashboard/features/BulkWhatsApp";
import ImportData from "./dashboard/features/ImportData";
import UserManager from "./dashboard/features/UserManager";
import SettingsForm from "./dashboard/features/SettingsForm";
import LandingEditor from "./dashboard/features/LandingEditor";
import LandingManager from "./dashboard/features/LandingManager";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  leads: "Clientes",
  emails: "Correos",
  whatsapp: "WhatsApp",
  import: "Importar Datos",
  users: "Usuarios",
  settings: "Configuración",
  landing: "Editor de Landing",
  landings: "Landings por Compañía",
};

export default function DashboardClient({ initialLeads = [], initialTotal = 0, initialStats = null, username, isAdmin = false, sellerSlug = null, sellerInfo = null }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const T = NEON_THEME[theme];

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const searchParams = useSearchParams();

  const [activeMenu, setActiveMenu] = useState(() => {
    const tab = searchParams.get("tab");
    return PAGE_TITLES[tab] ? tab : "dashboard";
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
      pageTitle={PAGE_TITLES[activeMenu]}
      isAdmin={isAdmin}
      sellerSlug={sellerSlug}
      onboardingNeeded={onboardingNeeded}
    >
      {activeMenu === "dashboard" && (
        <DashboardOverview
          filters={{ search, statusFilter, dateFilter, customDate }}
          initialStats={initialStats}
          T={T}
          isMobile={isMobile}
          onViewAllLeads={() => setActiveMenu("leads")}
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
          T={T}
          isMobile={isMobile || isTablet}
          isAdmin={isAdmin}
          defaultMessage={settings.sellerMsg}
          sellerName={sellerInfo?.name || settings.sellerName || username}
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

      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? "16px" : "24px",
            right: isMobile ? "16px" : "24px",
            left: isMobile ? "16px" : "auto",
            background: `${T.accent}18`,
            border: `1px solid ${T.accent}45`,
            color: T.accent,
            padding: isMobile ? "12px 16px" : "12px 24px",
            borderRadius: "14px",
            fontWeight: 700,
            fontSize: isMobile ? "13px" : "14px",
            boxShadow: T.glowGold,
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
