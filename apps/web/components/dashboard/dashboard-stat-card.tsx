type DashboardStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeClassName: string;
  iconContainerClassName: string;
  loading?: boolean;
};

export default function DashboardStatCard({
  title,
  value,
  description,
  icon,
  badge,
  badgeClassName,
  iconContainerClassName,
  loading = false,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-indigo-500/30">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconContainerClassName}`}
        >
          {icon}
        </div>

        <span className={badgeClassName}>
          {badge}
        </span>
      </div>

      <p className="mt-5 text-sm text-gray-400">
        {title}
      </p>

      <h3 className="mt-2 text-4xl font-bold text-white">
        {loading ? '...' : value}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}