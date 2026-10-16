import { type SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const username = value.trim().replace(/^@/, "");
    if (username) navigate(`/dev/${encodeURIComponent(username)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="GitHub username, e.g. gaearon"
        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
      <button
        type="submit"
        className="rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
      >
        Search
      </button>
    </form>
  );
}