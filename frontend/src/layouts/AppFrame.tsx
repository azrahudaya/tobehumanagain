import { UserCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AppFrameProps = {
  children: ReactNode;
};

export const AppFrame = ({ children }: AppFrameProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isProfilePage = location.pathname === "/profile" || location.pathname === "/settings";

  return (
    <div className="relative min-h-screen bg-[rgb(248,250,242)]">
      <button
        type="button"
        onClick={() => navigate("/profile")}
        aria-label="Open profile settings"
        className={`fixed right-6 top-6 z-50 h-12 w-12 rounded-full border shadow-[0_10px_20px_rgba(55,55,55,0.22)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99a7d4]/45 md:right-8 md:top-8 md:h-14 md:w-14 ${
          isProfilePage ? "border-[#8d9ac5] ring-2 ring-[#d6ddf5]" : "border-[#c7c7c7] hover:scale-[1.02]"
        }`}
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={`${user.displayName} profile`} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center rounded-full bg-[#d4d4d4] text-[#6d6d6d]">
            <UserCircle2 className="h-7 w-7" />
          </span>
        )}
      </button>

      {children}
    </div>
  );
};
