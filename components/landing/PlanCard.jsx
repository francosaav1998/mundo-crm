"use client";

import EditableText from "./EditableText";

export default function PlanCard({ plan, planIndex = 0, onSelect }) {
  const subtitle = plan.subtitle || plan.priceSubtitle || "";
  const cta = plan.cta || (plan.category === "duo" ? "Contratar Dúo" : "Contratar Plan");
  const p = `plan.${planIndex}`;

  return (
    <div
      key={plan.value}
      className={`plan-card ${plan.featured ? "featured" : ""}`}
    >
      <div className="plan-header">
        <h3 className="plan-title">
          <EditableText path={`${p}.title`}>{plan.title}</EditableText>
        </h3>
        <div className="plan-internet">
          <EditableText path={`${p}.speed`}>{plan.speed}</EditableText>{" "}
          <EditableText path={`${p}.speedLabel`} tag="span">{plan.speedLabel}</EditableText>
        </div>
        <div className="plan-price">
          <EditableText path={`${p}.price`}>{plan.price}</EditableText>{" "}
          <span>/ mes</span>
        </div>
        {subtitle && (
          <p className="plan-price-sub">
            <EditableText path={`${p}.priceSubtitle`}>{subtitle}</EditableText>
          </p>
        )}
      </div>
      <ul className="plan-features">
        {(plan.features || []).map((f, i) => (
          <li key={i} className={f.unavailable ? "unavailable" : ""}>
            <i className={f.unavailable ? f.icon : `bi ${f.icon}`}></i>{" "}
            <EditableText path={`${p}.features.${i}.text`}>{f.text}</EditableText>
          </li>
        ))}
      </ul>
      <div className="plan-cta">
        <button
          onClick={() => onSelect(plan.value)}
          className={`btn w-100 ${plan.featured ? "btn-primary" : ""}`}
        >
          <i className="bi bi-send-fill"></i>{" "}
          <EditableText path={`${p}.cta`}>{cta}</EditableText>
        </button>
      </div>
    </div>
  );
}
