import { DashboardPage } from "@app/router/dashboard";

export default function Page(props: PageProps<"/dashboard">) {
  return <DashboardPage {...props} />;
}
