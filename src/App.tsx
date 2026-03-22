import { AdminAuthProvider } from "./context/AdminAuthContext";
import AppRouter from "./page/router";

export default function App() {
  return (
    <AdminAuthProvider>
      <AppRouter />
    </AdminAuthProvider>
  );
}
