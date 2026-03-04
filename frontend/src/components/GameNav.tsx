import { Home, ListChecks, LayoutDashboard, Shield } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";

const links = [
  { to: "/title", label: "Title", icon: Home },
  { to: "/missions", label: "Missions", icon: ListChecks },
  { to: "/dashboard", label: "Reflection", icon: LayoutDashboard },
];

export const GameNav = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex flex-wrap items-center gap-2 bg-white/65 px-4 py-3 shadow-[0_8px_24px_rgba(68,48,50,0.08)] backdrop-blur">
      <p className="mr-auto text-xs font-extrabold uppercase tracking-[0.2em] text-[#5f4d53]">{user?.displayName ?? "Player"}</p>
      <nav className="flex items-center gap-1 rounded-full bg-[#fff8] p-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                isActive ? "bg-softBlue text-white" : "text-[#5d4b50] hover:bg-white"
              }`
            }
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      {user?.role === "ADMIN" && (
        <Button variant="secondary" className="h-8 rounded-full px-3 text-xs" onClick={() => navigate("/admin") }>
          <Shield className="h-3.5 w-3.5" />
          Admin
        </Button>
      )}
      <Button
        variant="ghost"
        className="h-8 rounded-full px-3 text-xs"
        onClick={async () => {
          await logout();
          navigate("/auth", { replace: true });
        }}
      >
        Logout
      </Button>
    </header>
  );
};
