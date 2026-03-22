import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

type AdminAuthState = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  adminEmail: string;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setAdminEmail("");
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data().role : null;
        if (role === "admin") {
          setUser(u);
          setIsAdmin(true);
          setAdminEmail(u.email ?? "");
        } else {
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
          setAdminEmail("");
        }
      } catch {
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        setAdminEmail("");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ loading, user, isAdmin, adminEmail }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider");
  }
  return ctx;
}
