"use client";

import { useState } from "react";
import LeadFilters from "./ui/LeadFilters";
import LeadTable from "./ui/LeadTable";
import Pagination from "./ui/Pagination";
import SectionHeader from "./ui/SectionHeader";

export default function LeadsView({ leads, total, page, totalPages, search, setSearch, statusFilter, setStatusFilter, onPageChange, onUpdateStatus, updating, loading = false, T, isMobile, isAdmin = false, showToast }) {
  return (
    <div>
      <SectionHeader
        eyebrow={isAdmin ? "Prospectos" : "Clientes y Leads"}
        title={isAdmin ? "Pipeline de vendedores" : "Gestión de clientes"}
        description={isAdmin
          ? "Gestiona a los vendedores que muestran interés en la plataforma. Marca su estado y avanza con su activación."
          : "Revisa tus clientes potenciales, filtra por estado, actualiza su situación y contáctalos rápidamente por WhatsApp o email."}
        T={T}
        isMobile={isMobile}
      />
      <div
        className="glass-card"
        style={{
          padding: isMobile ? "16px" : "30px",
        }}
      >
        <LeadFilters
        filter={statusFilter}
        setFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        T={T}
        isMobile={isMobile}
        isAdmin={isAdmin}
      />

      <LeadTable
        leads={leads}
        onUpdateStatus={onUpdateStatus}
        updating={updating}
        loading={loading}
        T={T}
        isMobile={isMobile}
        isAdmin={isAdmin}
        showToast={showToast}
      />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: "13px", color: T.muted, fontWeight: 500 }}>
            Mostrando {leads.length} de {total} leads
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} T={T} />
        </div>
      </div>
    </div>
  );
}
