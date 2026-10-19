
import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Bell, House, LogOut, Menu, Settings, UserRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import UserAvatar from "../../Shared/UserAvatar";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user, removeUserToken } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isAccountMenuOpen) return;
    function outside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsAccountMenuOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setIsAccountMenuOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [isAccountMenuOpen]);

  function logoutHandler(){
    removeUserToken()
  }

  const isActive = (path: string) =>
    path === pathname || (path === "/" && pathname === "/feed") || (path === "/profile" && pathname.startsWith("/profile/"));
  const navButtonClass = (path: string) =>
    `navbar-nav-button h-auto w-auto gap-2 rounded-xl px-4 py-3 text-base font-bold sm:px-7 ${
      isActive(path)
        ? "bg-primary text-white hover:bg-primary-hover"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white px-2 py-3 shadow-sm sm:px-6">
      <nav className="mx-auto flex max-w-[1920px] items-center justify-between gap-3" aria-label="Main navigation">
        <NavLink to="/feed" className="flex shrink-0 items-center gap-3" aria-label="NotFacebook feed">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-sm font-extrabold text-white shadow-sm">
            NF
          </span>
          <span className="hidden text-2xl font-extrabold tracking-tight text-slate-950 md:block">
            NotFacebook
          </span>
        </NavLink>

        {isAuthenticated && <div className="navbar-navigation flex items-center rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
          <Button
            onPress={() => navigate("/")}
            isIconOnly
            aria-label="Feed"
            variant="ghost"
            className={navButtonClass("/")}
          >
            <House className="size-5" strokeWidth={2.25} />
            <span className="navbar-nav-label hidden sm:inline">Feed</span>
          </Button>
          <Button
            onPress={() => navigate("/profile")}
            isIconOnly
            aria-label="Profile"
            variant="ghost"
            className={navButtonClass("/profile")}
          >
            <UserRound className="size-5" strokeWidth={2.25} />
            <span className="navbar-nav-label hidden sm:inline">Profile</span>
          </Button>
          <Button
            onPress={() => navigate("/notifications")}
            isIconOnly
            className={navButtonClass("/notifications")}
            aria-label="Notifications"
            variant="ghost"
          >
            <Bell className="size-5" strokeWidth={2.25} />
            <span className="navbar-nav-label hidden lg:inline">Notifications</span>
          </Button>
        </div>}

        {isAuthenticated && <div ref={menuRef} className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            className="flex items-center gap-3 rounded-full border-2 border-primary/50 bg-white py-1.5 pl-1.5 pr-3 text-slate-900 transition-colors hover:bg-primary-bg"
            aria-label={`Open ${user?.name || "your"} account menu`}
            aria-expanded={isAccountMenuOpen}
            aria-controls="account-options"
            onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
          >
            <UserAvatar user={user} className="size-9" />
            <span className="hidden max-w-36 truncate text-base font-bold lg:inline">{user?.name || "My account"}</span>
            <Menu className="size-6" strokeWidth={2.25} />
          </button>

          {isAccountMenuOpen && (
            <div
              id="account-options"
              className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-52 rounded-3xl border border-slate-100 bg-white p-2 shadow-lg"
              aria-label="Account options"
            >
              <button
                type="button"
                className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-lg font-bold text-slate-800 transition-colors hover:bg-primary-bg"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate("/profile");
                }}
              >
                <UserRound className="size-6" strokeWidth={2.25} />
                Profile
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-lg font-bold text-slate-800 transition-colors hover:bg-primary-bg"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings className="size-6" strokeWidth={2.25} />
                Settings
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-lg font-bold text-rose-500 transition-colors hover:bg-rose-50"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate("/auth/login");
                  logoutHandler()
                }}
              >
                <LogOut className="size-6" strokeWidth={2.25} />
                Logout
              </button>
            </div>
          )}
        </div>}
      </nav>
    </header>
  );
}
