import UsersDashboard from "./UsersDashboard";

export default async function Page(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const initialCreateOpen = searchParams?.create === "1";

  return <UsersDashboard initialCreateOpen={initialCreateOpen} />;
}
