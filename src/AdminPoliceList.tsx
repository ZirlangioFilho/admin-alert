import { useEffect, useState, type CSSProperties } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import {
  subscribePolice,
  updatePolice,
  deletePolice,
  type PoliceItem,
} from "./services/policeService";

const inputStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e2e8f0",
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

export default function AdminPoliceList() {
  const [police, setPolice] = useState<PoliceItem[]>([]);
  const [editing, setEditing] = useState<PoliceItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsub = subscribePolice(setPolice);
    return () => unsub();
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const startEdit = (p: PoliceItem) => {
    setEditing(p);
    setEditForm({ name: p.name, email: p.email, phone: p.phone });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setLoading(true);
    setMessage(null);
    try {
      await updatePolice(editing.uid, editForm);
      showMsg("success", "Dados atualizados. O e-mail de login só pode ser alterado no Firebase Console.");
      setEditing(null);
    } catch (e) {
      console.error(e);
      showMsg("error", "Não foi possível atualizar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      showMsg("success", "E-mail de redefinição de senha enviado.");
    } catch (e) {
      console.error(e);
      showMsg("error", "Não foi possível enviar o e-mail. Verifique se o endereço existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (p: PoliceItem) => {
    if (!window.confirm(`Excluir o policial ${p.name}? O cadastro será removido. O usuário não poderá mais acessar o sistema.`))
      return;
    setDeletingId(p.uid);
    setMessage(null);
    try {
      await deletePolice(p.uid);
      showMsg("success", "Policial removido.");
    } catch (e) {
      console.error(e);
      showMsg("error", "Não foi possível excluir.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPolice = police.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <section>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Policiais cadastrados</h2>
        {message && (
          <p style={{ color: message.type === "success" ? "#86efac" : "#fca5a5", margin: "0 0 12px", fontSize: 13 }}>
            {message.text}
          </p>
        )}
        <input
          placeholder="Buscar por nome ou e-mail"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "#e2e8f0", padding: "10px 12px", fontSize: 13, outline: "none"}}
        />
        {editing && (
          <div
            style={{
              background: "#0b1220",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>Editar: {editing.name}</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                placeholder="Nome"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="E-mail (atualiza só no cadastro)"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="Telefone"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={loading}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  border: "1px solid #475569",
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: "transparent",
                  color: "#e2e8f0",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {filteredPolice.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            {police.length === 0 ? "Nenhum policial cadastrado." : "Nenhum policial encontrado."}
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredPolice.map((p) => (
              <li
                key={p.uid}
                style={{
                  background: "#0b1220",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <strong style={{ color: "#e2e8f0" }}>{p.name}</strong>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>{p.email}</p>
                    <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 12 }}>{p.phone}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      disabled={!!editing}
                      style={{
                        border: "1px solid #475569",
                        borderRadius: 8,
                        padding: "6px 10px",
                        background: "transparent",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendPasswordReset(p.email)}
                      disabled={loading}
                      style={{
                        border: "1px solid #475569",
                        borderRadius: 8,
                        padding: "6px 10px",
                        background: "transparent",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Redefinir senha
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.uid}
                      style={{
                        border: "1px solid #dc2626",
                        borderRadius: 8,
                        padding: "6px 10px",
                        background: "transparent",
                        color: "#fca5a5",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      {deletingId === p.uid ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
