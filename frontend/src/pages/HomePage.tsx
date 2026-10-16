import SearchBar from "../components/SearchBar";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-xl space-y-4 pt-10 text-center sm:pt-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Look up any developer</h1>
      <p className="text-slate-400">
        Enter a GitHub username to see their stars, languages, commit activity and top repositories.
      </p>
      <SearchBar />
    </div>
  );
}