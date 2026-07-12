"use client";

export default function PlanCard({ plan, index, onSelect }) {
  const subtitle = plan.subtitle || plan.priceSubtitle || "";
  const cta = plan.cta || (plan.category === "duo" ? "Contratar Dúo" : "Contratar Plan");

  return (
    <div
      key={plan.value}
      className={`plan-card ${plan.featured ? "featured" : ""}`}
    >
      <div className="plan-header">
        <h3 className="plan-title">{plan.title}</h3>
        <div className="plan-internet">
          {plan.speed} <span>{plan.speedLabel}</span>
        </div>
        <div className="plan-price">
          {plan.price} <span>/ mes</span>
        </div>
        {subtitle && <p className="plan-price-sub">{subtitle}</p>}
      </div>
      <ul className="plan-features">
        {(plan.features || []).map((f, i) => (
          <li key={i} className={f.unavailable ? "unavailable" : ""}>
            <i className={f.unavailable ? f.icon : `bi ${f.icon}`}></i> {f.text}
          </li>
        ))}
      </ul>
      <div className="plan-cta">
        <button
          onClick={() => onSelect(plan.value)}
          className={`btn w-100 ${plan.featured ? "btn-primary" : ""}`}
        >
          <i className="bi bi-send-fill"></i> {cta}
        </button>
      </div>
    </div>
  );
}
