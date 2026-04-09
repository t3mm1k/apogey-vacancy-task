
export default async function DashboardLayout(props: LayoutProps<"/dashboard">) {
  return (
    <main>
      {props.children}
    </main>
  );
}
