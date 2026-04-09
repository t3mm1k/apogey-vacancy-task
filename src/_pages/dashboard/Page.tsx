import ClientButton from "./components/ClientButton";

interface DashboardWidgetProps {

}

export default async function Page({...props}: DashboardWidgetProps) {

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <ClientButton />
    </div>
  );
}