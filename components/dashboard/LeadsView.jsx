"use client";

import { useState } from "react";
import LeadFilters from "./ui/LeadFilters";
import LeadTable from "./ui/LeadTable";
import Pagination from "./ui/Pagination";

export default function LeadsView({ leads, total, page, totalPages, search, setSearch, statusFilter, setStatusFilter, onPageChange, onUpdateStatus, updating, T, isMobile, isAdmin = false }) {
  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "24px",
        padding: isMobile ? "16px" : "30px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
      }}
    >
      <LeadFilters
        filter={statusFilter}
        setFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        T={T}
        isMobile={isMobile}
      />

      <LeadTable
        leads={leads}
        onUpdateStatus={onUpdateStatus}
        updating={updating}
        T={T}
        isMobile={isMobile}
        isAdmin={isAdmin}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: "13px", color: T.muted, fontWeight: 600 }}>
          Mostrando {leads.length} de {total} leads
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} T={T} />
      </div>
    </div>
  );
}
