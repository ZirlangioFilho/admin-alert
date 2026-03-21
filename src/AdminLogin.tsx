import { useEffect, useState, type CSSProperties } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

type AdminLoginProps = {
  initialEmail?: string;
  infoMessage?: string;
};

export default function AdminLogin({
  initialEmail = "",
  infoMessage,
}: AdminLoginProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      const role = snap.exists() ? snap.data().role : null;

      if (role !== "admin") {
        await auth.signOut();
        setError(
          "Acesso negado. Esta conta não é de administrador. Use o painel policial (AlertApp Web) ou o app da vítima."
        );
        return;
      }
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #0c1929 0%, #1e293b 45%, #0f172a 100%)",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, Arial, sans-serif",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(17, 24, 39, 0.92)",
          border: "1px solid #334155",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            Painel restrito
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700 }}>Admin Alert</h1>
          <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
            Entre com a conta de administrador criada no Firebase. Não há cadastro por aqui — novos
            admins são definidos direto no banco.
          </p>
        </div>

        {infoMessage ? (
          <p style={{ margin: "0 0 16px", padding: 12, borderRadius: 10, background: "#14532d33", color: "#86efac", fontSize: 13 }}>
            {infoMessage}
          </p>
        ) : null}

        <div style={{ display: "grid", gap: 14 }}>
          <input
            type="email"
            placeholder="E-mail do administrador"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              background: loading ? "#475569" : "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error ? <p style={{ color: "#fca5a5", margin: 0, fontSize: 14 }}>{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

const inputStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e2e8f0",
  padding: "14px 16px",
  fontSize: 15,
  outline: "none",
};
