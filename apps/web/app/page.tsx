export default async function Home() {
  const res = await fetch("http://localhost:3000", { cache: "no-store" });
  const text = await res.text();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">MVP SaaS Multi-Associazioni 🚀</h1>

      <p className="text-xl">
        L'API dice: <span className="text-green-400">{text}</span>
      </p>
    </main>
  );
}