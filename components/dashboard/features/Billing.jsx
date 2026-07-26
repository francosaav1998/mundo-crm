"use client";

import { useEffect, useState } from "react";
import RippleButton from "@/components/ui/RippleButton";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";

export default function Billing({ T, isMobile, showToast }) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch("/api/subscription");
        if (!res.ok) throw new Error("Error al cargar facturación");
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        showToast(err.message || "Error al cargar facturación");
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, [showToast]);

  useEffect(() => {
    if (subscription?.status !== "pending") return undefined;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/subscription");
        if (!res.ok) return;
        const data = await res.json();
        setSubscription(data);
      } catch {
        // noop
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [subscription?.status]);

  async function handleSetupPayment() {
    if (subscription?.isTrial && subscription?.trialEndsAt) {
      const chargeDate = new Date(subscription.trialEndsAt).toLocaleDateString("es-CL");
      const confirmed = window.confirm(
        `Vas a registrar tu tarjeta ahora. El primer cobro de ${subscription.formattedAmount || "$29.990"} se realizará el ${chargeDate}. ¿Quieres continuar?`
      );
      if (!confirmed) return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backUrl: `${window.location.origin}/dashboard?tab=billing`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar pago");
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        throw new Error("No se recibió el link de pago");
      }
    } catch (err) {
      showToast(err.message || "Error al iniciar pago");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <span style={{ color: T.muted }}>Cargando facturación...</span>
      </div>
    );
  }

  const isExpired = subscription?.isExpired;
  const isTrial = subscription?.isTrial;
  const isActive = subscription?.isActive;
  const isPending = subscription?.status === "pending";
  const isPaidSubscription = subscription?.status === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        eyebrow="Suscripción"
        title="Facturación"
        description="Gestioná tu plan mensual y tu método de pago."
        T={T}
        isMobile={isMobile}
      />

      <div
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: isMobile ? "20px" : "28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 16,
            paddingBottom: 20,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Plan actual
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text, marginTop: 4 }}>
              {subscription?.planName || "Plan Ejecutivo"}
            </div>
            <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>
              {subscription?.formattedAmount || "$29.990"} / mes
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              background: isActive ? "rgba(37, 211, 102, 0.12)" : isExpired ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)",
              border: isActive ? "1px solid rgba(37, 211, 102, 0.25)" : isExpired ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(245, 158, 11, 0.25)",
              color: isActive ? "#16A34A" : isExpired ? "#DC2626" : "#F59E0B",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <i className={`bi ${isActive ? "bi-check-circle-fill" : isExpired ? "bi-exclamation-circle-fill" : "bi-clock-fill"}`} />
            {subscription?.label || "Sin suscripción"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isTrial && subscription?.trialEndsAt && !isExpired && (
            <InfoRow
              icon="bi-gift-fill"
              label="Período de prueba"
              value={`Finaliza el ${new Date(subscription.trialEndsAt).toLocaleDateString("es-CL")}`}
              accent={T.accent}
              T={T}
            />
          )}

          {isTrial && subscription?.trialEndsAt && !isExpired && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: `${T.accent}10`,
                border: `1px solid ${T.accent}25`,
                color: T.muted,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 8 }} />
              Puedes registrar la tarjeta ahora. El primer cobro de <strong>{subscription.formattedAmount || "$29.990"}</strong> se programará para el <strong>{new Date(subscription.trialEndsAt).toLocaleDateString("es-CL")}</strong>, cuando termine tu prueba gratis.
            </div>
          )}

          {isTrial && isExpired && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.10)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#DC2626",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 8 }} />
              Tu prueba gratis terminó. Configurá tu tarjeta para seguir usando tu landing.
            </div>
          )}

          {isActive && subscription?.nextPaymentDate && (
            <InfoRow
              icon="bi-calendar-event-fill"
              label="Próximo cobro"
              value={new Date(subscription.nextPaymentDate).toLocaleDateString("es-CL")}
              accent={T.accent}
              T={T}
            />
          )}

          {subscription?.lastFourDigits && (
            <InfoRow
              icon="bi-credit-card-fill"
              label="Tarjeta guardada"
              value={`${subscription.cardBrand || "Tarjeta"} •••• ${subscription.lastFourDigits}`}
              accent={T.accent}
              T={T}
            />
          )}

          {isPending && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: `${T.accent}10`,
                border: `1px solid ${T.accent}25`,
                color: T.accent,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <i className="bi bi-hourglass-split" style={{ marginRight: 8 }} />
              Pago pendiente. Completá el proceso en MercadoPago.
            </div>
          )}
        </div>

        {!isPaidSubscription && (
          <div style={{ marginTop: 8 }}>
            <RippleButton
              onClick={handleSetupPayment}
              disabled={processing}
              loading={processing}
              loadingText="Redirigiendo..."
              style={{
                width: isMobile ? "100%" : "auto",
                padding: "14px 24px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${T.accent} 0%, #0077A8 100%)`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: `0 6px 18px ${T.accent}35`,
              }}
            >
              <i className="bi bi-credit-card-fill" />
              {isExpired ? "Reactivar suscripción" : isPending ? "Completar autorización" : isTrial ? "Configurar tarjeta ahora" : "Configurar tarjeta"}
            </RippleButton>
          </div>
        )}

        {isPaidSubscription && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 13, color: T.muted }}>
              Tu suscripción está activa. Si cambiás de tarjeta, hacé clic en el botón de abajo.
            </p>
            <RippleButton
              onClick={handleSetupPayment}
              disabled={processing}
              loading={processing}
              loadingText="Redirigiendo..."
              style={{
                marginTop: 12,
                width: isMobile ? "100%" : "auto",
                padding: "12px 20px",
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.text,
                fontWeight: 700,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i className="bi bi-arrow-repeat" />
              Actualizar tarjeta
            </RippleButton>
          </div>
        )}
      </div>

      {subscription?.payments && subscription.payments.length > 0 && (
        <div
          style={{
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: isMobile ? "20px" : "28px",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 16 }}>
            Historial de pagos
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subscription.payments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: T.inputBg,
                }}
              >
                <div style={{ fontSize: 13, color: T.text }}>
                  {new Date(payment.paymentDate).toLocaleDateString("es-CL")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                    {payment.formattedAmount}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: payment.status === "approved" ? "rgba(37, 211, 102, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: payment.status === "approved" ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {payment.status === "approved" ? "Aprobado" : "Rechazado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, accent, T }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${accent}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 14, color: T.text, fontWeight: 700, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}
