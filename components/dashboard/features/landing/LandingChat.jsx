"use client";

import { useState, useRef, useEffect } from "react";
import { buildChatExamples } from "@/lib/ai/prompts";

export default function LandingChat({ mode = "seller", role = "seller", onApplyAction, T, isMobile, context, html, css }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const examples = buildChatExamples(role === "admin" || mode === "b2b" ? "b2b" : "seller");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/edit-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          mode,
          context,
          html,
          css,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.error || "No pude procesar eso. Prueba de otra forma." },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.message || "Listo." }]);
        if (data.action) {
          try {
            onApplyAction(data.action);
          } catch (err) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", text: `Se recibió la acción pero no se pudo aplicar: ${err.message}` },
            ]);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.message || "Error de conexión. Revisa tu API key." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>
      {/* Welcome card */}
      <div
        style={{
          padding: "16px",
          borderRadius: 18,
          background: `linear-gradient(135deg, ${T.accent}20 0%, ${T.accent}08 100%)`,
          border: `1px solid ${T.accent}35`,
          boxShadow: `0 8px 24px ${T.accent}15`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: T.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            <i className="bi bi-stars"></i>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text }}>
            Asistente de edición
          </h3>
        </div>
        <p style={{ margin: "0 0 8px 0", fontSize: 15, color: T.text, lineHeight: 1.5, fontWeight: 600 }}>
          Dime qué quieres cambiar de tu landing. Puedes pedirme de <strong>a un cambio por vez</strong>.
        </p>
        <p style={{ margin: 0, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          Ejemplos: cambiar textos, títulos, precios de planes, beneficios, nombre del vendedor, foto o botones.
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "12px",
          background: T.inputBg,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
        }}
      >
        {messages.length === 0 && (
          <div style={{ alignSelf: "center", textAlign: "center", padding: "20px 10px", color: T.muted, fontSize: 14, lineHeight: 1.5 }}>
            <i className="bi bi-chat-left-dots" style={{ fontSize: 28, display: "block", marginBottom: 10, color: T.accent }}></i>
            Escribe abajo o prueba un ejemplo para empezar.
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                  marginLeft: 4,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: T.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 9,
                  }}
                >
                  <i className="bi bi-robot"></i>
                </div>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Asistente
                </span>
              </div>
            )}
            <div
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? T.accent : `linear-gradient(135deg, ${T.bgCard} 0%, rgba(255,255,255,0.06) 100%)`,
                color: m.role === "user" ? "#fff" : T.text,
                padding: m.role === "user" ? "11px 14px" : "14px 16px",
                borderRadius: 16,
                fontSize: m.role === "user" ? 14 : 16,
                fontWeight: m.role === "user" ? 600 : 700,
                lineHeight: 1.55,
                boxShadow: m.role === "user" ? "0 2px 8px rgba(0,0,0,0.08)" : "0 4px 16px rgba(0,0,0,0.12)",
                border: m.role === "user" ? "none" : `1px solid ${T.accent}40`,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.muted, padding: "0 4px" }}>
            <span className="btn-spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.2)", borderTopColor: T.accent }} />
            Pensando...
          </div>
        )}
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
          PRUEBA CON ESTOS EJEMPLOS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(ex)}
              disabled={loading}
              style={{
                padding: "9px 14px",
                borderRadius: 999,
                border: `1px solid ${T.border}`,
                background: T.bgCard,
                color: T.text,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.accent;
                e.currentTarget.style.color = T.accent;
                e.currentTarget.style.background = `${T.accent}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.color = T.text;
                e.currentTarget.style.background = T.bgCard;
              }}
            >
              <i className="bi bi-magic" style={{ marginRight: 6, fontSize: 10 }}></i>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe qué quieres cambiar..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            background: T.bgCard,
            color: T.text,
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            background: T.accent,
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </form>
    </div>
  );
}
