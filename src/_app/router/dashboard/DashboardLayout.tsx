export default async function DashboardLayout(props: LayoutProps<"/dashboard">) {
  return (
    <main className="flex min-h-[100dvh] flex-col">
      {props.children}
    </main>
  );
}