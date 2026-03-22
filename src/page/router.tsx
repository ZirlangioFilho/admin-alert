import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminLogin from "../AdminLogin";
import AdminPoliceForm from "../AdminPoliceForm";

function LoadingScreen() {
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

/** Área administrativa: só usuário Firebase com role admin (validado no contexto). */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAdminAuth();

  if (loading) return <LoadingScreen />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/** Login: se já estiver como admin, vai direto ao painel. */
function LoginRoute() {
  const { loading, isAdmin } = useAdminAuth();
  const location = useLocation();
  const infoMessage = (location.state as { infoMessage?: string } | null)?.infoMessage;

  if (loading) return <LoadingScreen />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return <AdminLogin infoMessage={infoMessage} />;
}

function AdminDashboardPage() {
  const { adminEmail } = useAdminAuth();
  const navigate = useNavigate();

  const handlePoliceCreated = () => {
    /* Feedback de sucesso fica no AdminPoliceForm; sessão do admin continua ativa. */
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  if (!adminEmail) return <LoadingScreen />;

  return (
    <AdminPoliceForm
      adminEmail={adminEmail}
      onPoliceCreated={handlePoliceCreated}
      onLogout={handleLogout}
    />
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
