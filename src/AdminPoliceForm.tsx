import { useState, type CSSProperties } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import AdminPoliceList from "./AdminPoliceList";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, secondaryAuth } from "./firebase";

type AdminPoliceFormProps = {
  adminEmail: string;
  onPoliceCreated: () => void;
  onLogout: () => void;
};

export default function AdminPoliceForm({
  adminEmail,
  onPoliceCreated,
  onLogout,
}: AdminPoliceFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleCreatePolice = async () => {
    setError("");
    setSuccess("");

    if (!name.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setLoading(true);
    try {
      // Auth secundária: cria o usuário policial sem trocar a sessão do administrador em `auth`.
      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password
      );
      const uid = credential.user.uid;
      await signOut(secondaryAuth);

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          role: "police",
          createdBy: "admin-alert",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Policial cadastrado com sucesso. Você pode cadastrar outro ou sair quando quiser.");
      onPoliceCreated();
    } catch (err) {
      console.error(err);
      setError("Não foi possível cadastrar o policial. Verifique os dados ou se o e-mail já existe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#0f172a",
        overflow: "hidden",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, Arial, sans-serif",
        paddingInline: 24,
        gap: 12,
      }}
    >

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ marginTop: 0, marginBottom: 20, color: "#94a3b8", fontSize: 14 }}>
          Você permanece logado após cada cadastro. Use <strong>Sair</strong> para encerrar a sessão.
        </p>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            border: "1px solid #475569",
            borderRadius: 10,
            padding: "8px 12px",
            background: "#dc2626",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Sair
        </button>
      </div>
      <div style={{ width: "100%", maxWidth: 1200, display: "flex", gap: 16 }}>
        {/* Coluna esquerda: cadastro */}
        <section
          style={{
            width: 460,
            maxWidth: "100%",
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", width: '100%' }}>
              <h1 style={{ margin: 0, marginBottom: 8, fontSize: 22 }}>
                Cadastro policial
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                Logado como administrador:{" "}
                <strong style={{ color: "#e2e8f0" }}>{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <input
              placeholder="Nome do policial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Email institucional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Número do celular"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />

            <button
              type="button"
              onClick={handleCreatePolice}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "12px 14px",
                background: "#2563eb",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading ? "Cadastrando..." : "Cadastrar policial"}
            </button>

            {success && <p style={{ color: "#86efac", margin: 0 }}>{success}</p>}
            {error && <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p>}
          </div>
        </section>

        {/* Coluna direita: lista */}
        <section
          style={{
            flex: 1,
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: 16,
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: 24,
            minWidth: 320,
          }}
        >
          <AdminPoliceList />
        </section>
      </div>

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 1000,
          }}
          role="presentation"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-confirm-title" style={{ margin: "0 0 12px", fontSize: 18 }}>
              Sair da conta?
            </h2>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: 14 }}>
              Tem certeza que deseja sair? Você precisará fazer login novamente como administrador.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
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
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: "#dc2626",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const inputStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e2e8f0",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
};
