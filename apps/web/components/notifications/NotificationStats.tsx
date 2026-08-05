"use client";

type NotificationStatsProps = {
  total: number;
  unread: number;
  read: number;
};

export default function NotificationStats({
  total,
  unread,
  read,
}: NotificationStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-sm">
        <p className="text-sm text-gray-400">
          Totali
        </p>

        <p className="mt-2 text-3xl font-bold text-white">
          {total}
        </p>
      </article>

      <article className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 shadow-sm">
        <p className="text-sm text-blue-200">
          Non lette
        </p>

        <p className="mt-2 text-3xl font-bold text-blue-300">
          {unread}
        </p>
      </article>

      <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-sm">
        <p className="text-sm text-emerald-200">
          Lette
        </p>

        <p className="mt-2 text-3xl font-bold text-emerald-300">
          {read}
        </p>
      </article>
    </section>
  );
}