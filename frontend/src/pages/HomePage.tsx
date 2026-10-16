import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-bold">
            Stack<span className="text-indigo-400">Pulse</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="max-w-[180px] truncate text-sm text-slate-400 sm:max-w-none">
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-xl font-semibold">You are logged in</h2>
        <p className="mt-1 text-slate-400">Developer search comes next.</p>
      </main>
    </div>
  );
}