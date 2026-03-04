import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout } = useAuth();

  const [identifier, setIdentifier] = useState("admin");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loggedUser = await login({ identifier, password });
      if (loggedUser.role !== "ADMIN") {
        await logout();
        throw new Error("Akun ini bukan admin.");
      }

      toast.success("Admin login berhasil.");
      navigate("/admin", { replace: true });
    } catch (error) {
      if (error instanceof Error && error.message === "Akun ini bukan admin.") {
        toast.error(error.message);
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(248,250,242)] p-4">
      <Card className="w-full max-w-md">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7e6b71]">Admin Portal</p>
        <h1 className="mt-1 font-caveat text-5xl text-ink">To Be Human Again</h1>

        <div className="mt-5 space-y-3">
          <TextInput
            placeholder="Username or Email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button fullWidth onClick={handleLogin} disabled={loading || !identifier || !password}>
            {loading ? "Loading..." : "Masuk Admin"}
          </Button>
        </div>

        <div className="mt-6 text-xs text-[#6b5a60]">
          <Link to="/auth" className="font-bold text-softBlue hover:underline">
            Kembali ke login pemain
          </Link>
        </div>
      </Card>
    </div>
  );
};
