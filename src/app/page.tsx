import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-950 text-white">
      <h1 className="text-5xl font-bold tracking-tight">Slay the Bearboy</h1>
      <p className="text-zinc-400">A deck-building card game</p>
      <Link
        href="/play"
        className="rounded-lg bg-red-700 px-8 py-4 text-lg font-bold transition-colors hover:bg-red-600"
      >
        Play
      </Link>
    </div>
  );
}
