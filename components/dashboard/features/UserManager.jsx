"use client";
import { useState } from "react";

export default function UserManager({ T, isMobile, showToast }) {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [message, setMessage] = useState({ type: "", text: "" });

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
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newUserRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando usuario");
      setUsers((prev) => [...prev, data]);
      setNewUsername("");
      setNewPassword("");
      setNewUserRole("user");
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
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
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

          <button
            type="submit"
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: T.accent,
              color: T.bg,
              fontWeight: 800,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <i className="bi bi-person-plus-fill" style={{ marginRight: 6 }}></i>
            Crear Usuario
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>
          <i className="bi bi-people-fill" style={{ marginRight: 8 }}></i>
          Usuarios Existentes
        </h2>

        {!hasLoaded ? (
          <button
            onClick={loadUsers}
            disabled={usersLoading}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: T.accent,
              color: T.bg,
              fontWeight: 800,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className={`bi ${usersLoading ? "bi-arrow-clockwise" : "bi-people-fill"}`}></i>
            {usersLoading ? "Cargando..." : "Cargar usuarios"}
          </button>
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
