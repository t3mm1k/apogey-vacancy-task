import UsersDashboard from "@pages/dashboard/UsersDashboard";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const initialCreateOpen = searchParams?.create === "1";

  return <UsersDashboard initialCreateOpen={initialCreateOpen} />;
}
