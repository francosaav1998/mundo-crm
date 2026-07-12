"use client";

import { useState } from "react";
import LeadFilters from "./ui/LeadFilters";
import LeadTable from "./ui/LeadTable";
import Pagination from "./ui/Pagination";

export default function LeadsView({ leads, total, page, totalPages, search, setSearch, statusFilter, setStatusFilter, onPageChange, onUpdateStatus, updating, T, isMobile, isAdmin = false, defaultMessage = "", sellerName = "", showToast }) {
  return (
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
      />

      <LeadTable
        leads={leads}
        onUpdateStatus={onUpdateStatus}
        updating={updating}
        T={T}
        isMobile={isMobile}
        isAdmin={isAdmin}
        defaultMessage={defaultMessage}
        sellerName={sellerName}
        showToast={showToast}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: "13px", color: T.muted, fontWeight: 500 }}>
          Mostrando {leads.length} de {total} leads
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} T={T} />
      </div>
    </div>
  );
}
