"use client";

export default function PlanCard({ plan, index, onSelect }) {
  return (
    <div
      key={plan.value}
      className={`plan-card scroll-animate fade-in-up delay-${(index % 3) + 1} ${
        plan.featured ? "featured" : ""
      }`}
    >
      <div className="plan-header">
        <h3 className="plan-title">{plan.title}</h3>
        <div className="plan-internet">
          {plan.speed} <span>{plan.speedLabel}</span>
        </div>
        <div className="plan-price">
          {plan.price} <span>/ mes</span>
        </div>
        <p className="plan-price-sub">{plan.subtitle}</p>
      </div>
      <ul className="plan-features">
        {plan.features.map((f, i) => (
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
          <i className="bi bi-send-fill"></i> {plan.cta}
        </button>
      </div>
    </div>
  );
}
