"use client";
import { useEffect, useState } from "react";
import RippleButton from "@/components/ui/RippleButton";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";

export default function UserManager({ T, isMobile, showToast }) {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [newUserCompany, setNewUserCompany] = useState("");
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let cancelled = false;
    async function loadCompanies() {
      setCompaniesLoading(true);
      try {
        const res = await fetch("/api/companies");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCompanies(data);
          setNewUserCompany((prev) => (data.length > 0 && !prev ? data[0].slug : prev));
        }
      } catch (err) {
        console.error("Error cargando compañías:", err);
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    }
    loadCompanies();
    return () => { cancelled = true; };
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("No autorizado o error del servidor");
      const data = await res.json();
      setUsers(data);
      setHasLoaded(true);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      showToast?.(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newUserRole,
          companySlug: newUserCompany,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando usuario");
      setUsers((prev) => [...prev, data]);
      setNewUsername("");
      setNewPassword("");
      setNewUserRole("user");
      setNewUserCompany(companies[0]?.slug || "");
      const successText = "Usuario creado correctamente";
      setMessage({ type: "success", text: successText });
      showToast?.(successText);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      showToast?.(err.message);
    }
  };

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

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader
        eyebrow="Usuarios"
        title="Gestión de usuarios"
        description="Crea nuevos ejecutivos de ventas, define sus roles y asigna compañías para que cada uno vea los planes y branding correctos en su landing."
        T={T}
        isMobile={isMobile}
      />
      <div style={cardStyle}>
        <h2 style={titleStyle}>
          <i className="bi bi-person-plus-fill" style={{ marginRight: 8 }}></i>
          Crear Nuevo Usuario
        </h2>

        {message.text && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: 16,
            background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
            border: `1px solid ${message.type === "error" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
            color: message.type === "error" ? "#EF4444" : "#10B981",
            fontSize: "13px",
            fontWeight: 700,
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={createUser} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Usuario</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="ej: vendedor1"
              required
              style={inputStyle}
            />
            <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
              Se convertirá a {newUsername ? `${newUsername}@mundo-crm.local` : "usuario@mundo-crm.local"}
            </span>
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Rol</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              style={inputStyle}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Compañía</label>
            <select
              value={newUserCompany}
              onChange={(e) => setNewUserCompany(e.target.value)}
              disabled={companiesLoading}
              style={inputStyle}
            >
              {companiesLoading ? (
                <option value="">Cargando compañías...</option>
              ) : companies.length === 0 ? (
                <option value="">No hay compañías disponibles</option>
              ) : (
                companies.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
              Determina qué planes y branding verá este vendedor en su landing.
            </span>
          </div>

          <RippleButton
            type="submit"
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: T.accent,
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "14px",
            }}
          >
            <i className="bi bi-person-plus-fill" style={{ marginRight: 6 }}></i>
            Crear Usuario
          </RippleButton>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>
          <i className="bi bi-people-fill" style={{ marginRight: 8 }}></i>
          Usuarios Existentes
        </h2>

        {!hasLoaded ? (
          <RippleButton
            onClick={loadUsers}
            disabled={usersLoading}
            loading={usersLoading}
            loadingText="Cargando..."
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: T.accent,
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="bi bi-people-fill"></i>
            Cargar usuarios
          </RippleButton>
        ) : usersLoading ? (
          <div style={{ color: T.muted, fontSize: "14px" }}>Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div style={{ color: T.muted, fontSize: "14px" }}>No hay usuarios registrados.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: T.text, fontSize: "14px" }}>{u.email}</div>
                  <div style={{ fontSize: "12px", color: T.muted }}>
                    Rol: <span style={{ textTransform: "capitalize" }}>{u.role}</span>
                    {u.company ? ` · Compañía: ${u.company}` : " · Sin compañía"}
                  </div>
                </div>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background: u.role === "admin" ? `${T.accent}30` : "rgba(148, 163, 184, 0.2)",
                  color: u.role === "admin" ? T.accent : T.muted,
                  border: `1px solid ${u.role === "admin" ? `${T.accent}50` : T.border}`,
                }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
