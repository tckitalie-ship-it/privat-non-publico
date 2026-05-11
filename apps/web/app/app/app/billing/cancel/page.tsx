export default function BillingCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow rounded-2xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>

        <h1 className="text-3xl font-bold mb-3">
          Pagamento annullato
        </h1>

        <p className="text-gray-600 mb-6">
          Nessun addebito effettuato.
        </p>

        <a
          href="/dashboard"
          className="border px-5 py-3 rounded-xl inline-block"
        >
          Torna alla dashboard
        </a>
      </div>
    </main>
  );
}