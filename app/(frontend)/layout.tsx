import { GlobalLayout } from "@app/globals";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Апогей Тестовое",
};

export default function Layout(props: LayoutProps<"/">) {
  return (<GlobalLayout {...props} />);
}