import { useState, type CSSProperties } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreatePolice = async () => {
    setError("");
    setSuccess("");

    if (!name.trim() || !phone.trim() || !address.trim() || !email.trim() || !password || !confirmPassword) {
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
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          email: email.trim(),
          role: "police",
          createdBy: "admin-alert",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess("Policial cadastrado com sucesso.");
      setName("");
      setPhone("");
      setAddress("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Não foi possível cadastrar o policial. Verifique os dados.");
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
        background: "#0f172a",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, Arial, sans-serif",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#111827",
          border: "1px solid #334155",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>Admin Alert</h1>
        <p style={{ marginTop: 0, marginBottom: 20, color: "#94a3b8" }}>
          Cadastre contas policiais para acesso ao painel web.
        </p>

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
            placeholder="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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

          {error && <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p>}
          {success && <p style={{ color: "#86efac", margin: 0 }}>{success}</p>}
        </div>
      </section>
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

export default App;
