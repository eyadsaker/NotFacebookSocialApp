import { Bookmark, Globe, Newspaper, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Feed", icon: Newspaper, active: pathname === "/" || pathname === "/feed" },
    { to: "/profile", label: "My Posts", icon: Sparkles, active: pathname === "/profile" },
    { to: "/community", label: "Community", icon: Globe, active: pathname === "/community" },
    { to: "/saved", label: "Saved", icon: Bookmark, active: pathname === "/saved" },
  ];
  return <nav aria-label="Feed navigation" className="social-panel grid grid-cols-4 gap-1 p-2 lg:grid-cols-1 lg:p-3">
    {links.map(({ to, label, icon: Icon, active }) => <NavLink key={to} to={to} className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm lg:flex-row lg:gap-3 lg:px-4 ${active ? "bg-primary-bg text-primary" : "text-slate-700 hover:bg-slate-50"}`}><Icon size={20} />{label}</NavLink>)}
  </nav>;
}
