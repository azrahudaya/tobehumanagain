import {
  Home,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  User,
  UserCircle2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/missions", label: "Missions", icon: ListChecks },
  { to: "/dashboard", label: "Reflection", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
];

export const GameNav = () => {
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-[#bcaeb3]/70 bg-[linear-gradient(180deg,rgba(252,252,252,0.9)_0%,rgba(244,240,237,0.92)_100%)] shadow-[0_14px_32px_rgba(66,44,48,0.12)] backdrop-blur-md lg:block">
        <div className="mx-auto w-full max-w-6xl px-6 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#ccbfc3] bg-white/80 px-3 py-2 shadow-[0_8px_20px_rgba(89,67,71,0.12)]">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.displayName} avatar`}
                    className="h-10 w-10 rounded-xl border border-[#c2b8bc] object-cover shadow-md"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(180deg,#8fa3d8_0%,#7588bb_100%)] text-white shadow-md">
                    <UserCircle2 className="h-6 w-6" />
                  </span>
                )}
                <div className="leading-tight">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#705e65]">Player</p>
                  <p className="font-caveat text-3xl font-bold text-[#46353a]">{user?.displayName ?? "Player"}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#d2c8cc] bg-white/75 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#67565d]">
                <Sparkles className="h-3.5 w-3.5 text-[#7f8fbe]" />
                Game Menu
              </div>
            </div>

            <div className="flex items-center gap-2">
              <nav className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl border border-[#c8bcc0] bg-white/70 p-2">
                {links.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex min-h-11 min-w-[9rem] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 font-caveat text-2xl leading-none transition ${
                        isActive
                          ? "border-[#7687bb] bg-[linear-gradient(180deg,#8d9fd1_0%,#6f82ba_100%)] text-white shadow-[0_8px_18px_rgba(82,95,140,0.35)]"
                          : "border-transparent bg-white/80 text-[#58474d] hover:border-[#d0c6ca] hover:bg-white"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#bcaeb3]/70 bg-[linear-gradient(180deg,rgba(252,252,252,0.98)_0%,rgba(244,240,237,0.98)_100%)] shadow-[0_-10px_24px_rgba(66,44,48,0.14)] backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                `inline-flex min-h-[58px] items-center justify-center rounded-xl border transition ${
                  isActive
                    ? "border-[#7687bb] bg-[linear-gradient(180deg,#8d9fd1_0%,#6f82ba_100%)] text-white shadow-[0_8px_18px_rgba(82,95,140,0.3)]"
                    : "border-transparent bg-white/75 text-[#5f4d53]"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
