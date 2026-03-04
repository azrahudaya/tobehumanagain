import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { GameNav } from "./components/GameNav";
import { useAuth } from "./context/AuthContext";
import { AppFrame } from "./layouts/AppFrame";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { CreditsPage } from "./pages/CreditsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MissionsPage } from "./pages/MissionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StoryPage } from "./pages/StoryPage";
import { TitleScreenPage } from "./pages/TitleScreenPage";

const ProtectedLayout = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="grid min-h-screen place-items-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppFrame>
      <GameNav />
      <Outlet />
    </AppFrame>
  );
};

export const App = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/title" element={<TitleScreenPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/title" replace />} />
    </Routes>
  );
};
