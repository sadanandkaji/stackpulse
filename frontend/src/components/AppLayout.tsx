import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <Link to="/" className="shrink-0 text-lg font-bold">
              Stack<span className="text-indigo-400">Pulse</span>
            </Link>
            <nav className="flex gap-4 overflow-x-auto whitespace-nowrap text-sm text-slate-300">
              <Link to="/" className="hover:text-white">Search</Link>
              <Link to="/compare" className="hover:text-white">Compare</Link>
              <Link to="/pins" className="hover:text-white">Pins</Link>
              <Link to="/saved" className="hover:text-white">Saved</Link>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-sm text-slate-400 md:block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}