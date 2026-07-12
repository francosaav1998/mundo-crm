"use client";

import { useMemo, useState } from "react";
import PlanCard from "./PlanCard";

const ALL_TABS = [
  { key: "all", label: "Todos los Planes" },
  { key: "internet", label: "Solo Internet" },
  { key: "duo", label: "Internet + TV" },
  { key: "movil", label: "Telefonía Móvil" },
];

export const PLANS = [
  {
    category: "internet",
    title: "Fibra Súper Rápida",
    speed: "800 Mbps",
    speedLabel: "Simétricos",
    price: "$12.990",
    subtitle: "Valor mensual final. Fibra óptica directa.",
    features: [
      { icon: "bi-speedometer2", text: "Velocidad simétrica ideal para streaming" },
      { icon: "bi-router-fill", text: "Router Wi-Fi de alta cobertura" },
      { icon: "bi-infinity", text: "Navegación ilimitada sin límites de descarga" },
      { icon: "bi-x-circle", text: "Canales de TV Digital", unavailable: true },
    ],
    cta: "Contratar Plan",
    value: "Plan Fibra 800 Megas ($12.990)",
  },
  {
    category: "internet",
    title: "Hiper Fibra Giga",
    speed: "1 Giga",
    speedLabel: "(1000 Mbps)",
    price: "$15.990",
    subtitle: "Velocidad extrema para múltiples dispositivos.",
    features: [
      { icon: "bi-speedometer2", text: "Velocidad máxima de 1000 Mbps" },
      { icon: "bi-router-fill", text: "Router de alto rendimiento (Dual Band)" },
      { icon: "bi-gamepad", text: "Ideal para teletrabajo, gaming y 4K" },
      { icon: "bi-x-circle", text: "Canales de TV Digital", unavailable: true },
    ],
    cta: "Contratar Plan",
    featured: true,
    value: "Plan Hiper Fibra 1 Giga ($15.990)",
  },
  {
    category: "duo",
    title: "Dúo Pack Plus",
    speed: "800 Mbps",
    speedLabel: "+ TV GO!",
    price: "$23.990",
    subtitle: "Internet + TV interactiva.",
    features: [
      { icon: "bi-speedometer2", text: "800 Mbps simétricos de velocidad" },
      { icon: "bi-tv", text: "Mundo GO! con más de 100 canales HD" },
      { icon: "bi-arrow-clockwise", text: "Pausa, retrocede y repite programación" },
      { icon: "bi-phone-vibrate", text: "Acceso a la app de TV para tu celular" },
    ],
    cta: "Contratar Dúo",
    value: "Plan Dúo 800 Megas + TV ($23.990)",
  },
  {
    category: "duo",
    title: "Dúo Pack Premium Giga",
    speed: "1 Giga",
    speedLabel: "+ TV GO!",
    price: "$26.990",
    subtitle: "La experiencia de entretenimiento definitiva.",
    features: [
      { icon: "bi-speedometer2", text: "1000 Mbps de velocidad extrema" },
      { icon: "bi-tv", text: "Mundo GO! Premium + canales interactivos" },
      { icon: "bi-display", text: "Compatible con Smart TV, consolas y PCs" },
      { icon: "bi-lightning-charge", text: "Menor latencia del mercado chileno" },
    ],
    cta: "Contratar Dúo",
    value: "Plan Dúo 1 Giga + TV ($26.990)",
  },
  {
    category: "movil",
    title: "Móvil Portabilidad",
    speed: "Gigas Libres",
    speedLabel: "4G/5G",
    price: "$5.990",
    subtitle: "Cámbiate conservando tu número actual.",
    features: [
      { icon: "bi-telephone-fill", text: "Minutos libres a todo destino" },
      { icon: "bi-chat-left-dots-fill", text: "Redes sociales libres (WhatsApp, RRSS)" },
      { icon: "bi-globe", text: "Gigas libres para navegación" },
      { icon: "bi-check2-all", text: "Sin contratos de permanencia obligatoria" },
    ],
    cta: "Portarme Ahora",
    value: "Plan Móvil Gigas Libres ($5.990)",
  },
];

export default function PlansSection({ onSelectPlan, plans, company = null, content = {} }) {
  const [activeTab, setActiveTab] = useState("all");

  const displayPlans = plans && plans.length > 0 ? plans : PLANS;
  const hasMovil = displayPlans.some((p) => p.category === "movil");

  const c = content || {};
  const tabs = Array.isArray(c.tabs) && c.tabs.length > 0
    ? c.tabs.filter((t) => t.key !== "movil" || hasMovil)
    : ALL_TABS.filter((t) => t.key !== "movil" || hasMovil);

  const filteredPlans = useMemo(
    () => (activeTab === "all" ? displayPlans : displayPlans.filter((p) => p.category === activeTab)),
    [activeTab, displayPlans]
  );

  const companyName = company?.name || "Mundo";
  const description = (c.description || "Explora las mejores ofertas en Internet Fibra Óptica y Dúos de {companyName}.").replace(
    /{companyName}/g,
    companyName
  );

  return (
    <section id="planes" className="planes-section">
      <div className="container">
        <div className="section-header">
          <h2>
            {c.title || "Elige el"} <span>{c.titleHighlight || "Plan Perfecto"}</span> {c.titleSuffix || "para Ti"}
          </h2>
          <p>{description}</p>
        </div>

        <div className="planes-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="planes-grid">
          {filteredPlans.map((plan, index) => (
            <PlanCard key={plan.value} plan={plan} index={index} onSelect={onSelectPlan} />
          ))}
        </div>
      </div>
    </section>
  );
}
