import "./lib/css/globals.css";
import "./lib/css/material-symbols-outlined.css";
import 'overlayscrollbars/overlayscrollbars.css';
import "./lib/css/input-scrollbar-plugin.css";
import { Rubik } from "@shared/lib/fonts/rubik/Rubik";
import { MaterialSymbols } from "@shared/lib/fonts/icons/MaterialSymbols";
import GlobalClientScripts from "./GlobalClientScripts";

export default async function GlobalLayout(props: LayoutProps<"/">) {

  return (
    <html lang="ru"
      className={`${Rubik.variable} ${MaterialSymbols.variable} antialiased`}
      data-overlayscrollbars-initialize
    >
      <body id="main-container" data-overlayscrollbars-initialize>
        <GlobalClientScripts />
        {props.children}
      </body>
    </html>
  );
}
