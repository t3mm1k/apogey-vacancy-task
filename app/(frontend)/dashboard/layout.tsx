import { DashboardLayout } from "@app/router/dashboard";

export const dynamic = "force-dynamic";

export default function Layout(props: LayoutProps<"/dashboard">) {
  return (
    <DashboardLayout {...props} />
  );
}
