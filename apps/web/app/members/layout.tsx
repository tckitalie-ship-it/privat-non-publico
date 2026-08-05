import DashboardLayout from "../dashboard/layout";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}