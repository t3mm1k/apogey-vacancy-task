import { redirect } from "next/navigation";

export default function Page(props: PageProps<"/">) {
  redirect("/dashboard")
}
