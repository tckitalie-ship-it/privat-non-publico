export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow rounded-2xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>

        <h1 className="text-3xl font-bold mb-3">
          Pagamento completato
        </h1>

        <p className="text-gray-600 mb-6">
          L'abbonamento Stripe è stato attivato correttamente.
        </p>

        <a
          href="/dashboard"
          className="bg-black text-white px-5 py-3 rounded-xl inline-block"
        >
          Torna alla dashboard
        </a>
      </div>
    </main>
  );
}