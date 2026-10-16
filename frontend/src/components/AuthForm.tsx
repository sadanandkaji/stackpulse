import { type SyntheticEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/api";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const isSignup = mode === "signup";

 async function onSubmit(e: SyntheticEvent<HTMLFormElement>)  {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await (isSignup ? signup : login)(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.details?.map((d) => d.message).join(". ") ?? err.message);
      } else {
        setError("Could not reach the server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Stack<span className="text-indigo-400">Pulse</span>
          </h1>
          <p className="text-sm text-slate-400">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignup ? 8 : 1}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              className={inputClass}
            />
          </label>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>

        <p className="text-center text-sm text-slate-400">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-indigo-400 hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link to="/signup" className="font-medium text-indigo-400 hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}