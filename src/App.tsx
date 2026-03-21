import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import AdminLogin from "./AdminLogin";
import AdminPoliceForm from "./AdminPoliceForm";

type View = "loading" | "login" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("loading");
  const [adminEmail, setAdminEmail] = useState("");
  const [postCreateMessage, setPostCreateMessage] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setView("login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? snap.data().role : null;

        if (role === "admin") {
          setAdminEmail(user.email ?? "");
          setView("dashboard");
        } else {
          await signOut(auth);
          setView("login");
        }
      } catch {
        await signOut(auth);
        setView("login");
      }
    });

    return () => unsub();
  }, []);

  const handlePoliceCreated = () => {
    // Sessão do admin permanece; feedback fica no AdminPoliceForm.
    setPostCreateMessage("");
  };

  const handleLogout = async () => {
    setPostCreateMessage("");
    await signOut(auth);
    setView("login");
  };

  if (view === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (view === "dashboard" && adminEmail) {
    return (
      <AdminPoliceForm
        adminEmail={adminEmail}
        onPoliceCreated={handlePoliceCreated}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminLogin initialEmail={adminEmail} infoMessage={postCreateMessage || undefined} />
  );
}
