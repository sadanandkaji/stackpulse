import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/", label: "Search", end: true },
  { to: "/compare", label: "Compare", end: false },
  { to: "/pins", label: "Pins", end: false },
  { to: "/saved", label: "Saved", end: false },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the sidebar with Escape and lock page scroll while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-white" : "text-slate-300 hover:text-white";

  const drawerLink = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2.5 text-base ${
      isActive ? "bg-indigo-500/15 font-semibold text-indigo-300" : "text-slate-300 hover:bg-slate-800"
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Hamburger: mobile only */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800 md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="shrink-0 text-lg font-bold">
              Stack<span className="text-indigo-400">Pulse</span>
            </Link>

            {/* Top nav: desktop only */}
            <nav className="hidden gap-5 text-sm md:flex">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={desktopLink}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Email and logout in the header: desktop only (mobile has them in the sidebar) */}
          <div className="hidden items-center gap-3 md:flex">
            <span className="max-w-[220px] truncate text-sm text-slate-400">{user?.email}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <aside
          aria-hidden={!open}
          className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] flex-col border-r border-slate-800 bg-slate-900 transition-[transform,visibility] duration-200 ${
            open ? "translate-x-0" : "invisible -translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <span className="text-lg font-bold">
              Stack<span className="text-indigo-400">Pulse</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={drawerLink} onClick={() => setOpen(false)}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 border-t border-slate-800 p-4">
            <p className="truncate text-sm text-slate-400">{user?.email}</p>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </aside>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}