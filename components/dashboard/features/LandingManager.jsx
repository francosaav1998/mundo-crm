"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";

export default function LandingManager({ T, isMobile, showToast }) {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sellersRes, companiesRes] = await Promise.all([
          fetch("/api/sellers"),
          fetch("/api/companies"),
        ]);

        if (!sellersRes.ok) throw new Error("Error cargando vendedores");
        if (!companiesRes.ok) throw new Error("Error cargando compañías");

        const sellersData = await sellersRes.json();
        const companiesData = await companiesRes.json();

        setSellers(sellersData);
        setCompanies(companiesData);
      } catch (err) {
        showToast(err.message || "Error al cargar landings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const grouped = useMemo(() => {
    const groups = {};
    companies.forEach((c) => {
      groups[c.slug] = { company: c, sellers: [] };
    });
    groups.unassigned = {
      company: { slug: "unassigned", name: "Sin compañía", brandColor: "#64748B" },
      sellers: [],
    };

    sellers.forEach((seller) => {
      const slug = seller.company?.slug || "unassigned";
      if (!groups[slug]) {
        groups[slug] = { company: seller.company || groups.unassigned.company, sellers: [] };
      }
      groups[slug].sellers.push(seller);
    });

    return groups;
  }, [sellers, companies]);

  const filteredGroups = useMemo(() => {
    const result = {};
    Object.entries(grouped).forEach(([slug, group]) => {
      if (selectedCompany !== "all" && selectedCompany !== slug) return;
      const filteredSellers = group.sellers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredSellers.length > 0 || selectedCompany === slug) {
        result[slug] = { ...group, sellers: filteredSellers };
      }
    });
    return result;
  }, [grouped, selectedCompany, search]);

  const cardStyle = {
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: "24px",
    padding: isMobile ? "20px" : "30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(20px)",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: 800,
    color: T.accent,
    marginBottom: 16,
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: "12px",
    color: T.text,
    fontSize: "14px",
    outline: "none",
  };

  if (loading) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: 60 }}>
        <p style={{ color: T.muted }}>Cargando vendedores y compañías...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader
        eyebrow="Landings por Compañía"
        title="Gestión de landings"
        description="Revisa, abre y comparte la landing de cada vendedor agrupada por compañía. También puedes copiar el link de cada landing para compartir."
        T={T}
        isMobile={isMobile}
      />
      <div style={cardStyle}>
        <h2 style={titleStyle}>
          <i className="bi bi-globe-americas" style={{ marginRight: 8 }}></i>
          Landings por Compañía
        </h2>
        <p style={{ fontSize: "13px", color: T.muted, marginBottom: 20, lineHeight: 1.5 }}>
          Desde aquí el administrador puede revisar, abrir y compartir la landing de cada vendedor agrupada por compañía.
        </p>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vendedor, slug o email..."
              style={inputStyle}
            />
          </div>
          <div style={{ minWidth: isMobile ? "100%" : 220 }}>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={inputStyle}
            >
              <option value="all">Todas las compañías</option>
              {companies.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
              <option value="unassigned">Sin compañía</option>
            </select>
          </div>
        </div>

        {Object.keys(filteredGroups).length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted, fontSize: "14px" }}>
            <i className="bi bi-search" style={{ fontSize: 24, display: "block", marginBottom: 10 }}></i>
            No se encontraron vendedores con esos filtros.
          </div>
        )}

        {Object.entries(filteredGroups).map(([slug, group]) => (
          <div
            key={slug}
            style={{
              marginBottom: 24,
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              background: T.inputBg,
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: group.company.brandColor || T.accent,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className="bi bi-building-fill" style={{ fontSize: 18 }}></i>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{group.company.name}</span>
                <span
                  style={{
                    fontSize: "12px",
                    opacity: 0.9,
                    background: "rgba(255,255,255,0.2)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {group.sellers.length} vendedor{group.sellers.length !== 1 ? "es" : ""}
                </span>
              </div>
              <a
                href={`/p/${group.sellers[0]?.slug || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.2)",
                  padding: "6px 12px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bi bi-eye-fill"></i> Ver primera
              </a>
            </div>

            <div style={{ padding: "12px" }}>
              {group.sellers.map((seller) => (
                <div
                  key={seller.id}
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: seller.photo ? "transparent" : "rgba(148,163,184,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      {seller.photo ? (
                        <Image
                          src={seller.photo}
                          alt={seller.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="44px"
                        />
                      ) : (
                        <i className="bi bi-person-fill" style={{ color: T.muted, fontSize: 20 }}></i>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: T.text, fontSize: "14px" }}>{seller.name}</div>
                      <div style={{ fontSize: "12px", color: T.muted, marginTop: 2 }}>
                        {seller.email || "Sin email"} · {seller._count?.leads ?? 0} leads
                      </div>
                      <div style={{ fontSize: "11px", color: T.accent, marginTop: 4, fontWeight: 700 }}>
                        /p/{seller.slug}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href={`/p/${seller.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: `${T.accent}15`,
                        border: `1px solid ${T.accent}40`,
                        color: T.accent,
                        fontSize: "12px",
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <i className="bi bi-eye-fill"></i> Ver landing
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/p/${seller.slug}`);
                        showToast("Link copiado al portapapeles");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: "rgba(148,163,184,0.1)",
                        border: `1px solid ${T.border}`,
                        color: T.text,
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <i className="bi bi-link-45deg"></i> Copiar link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
