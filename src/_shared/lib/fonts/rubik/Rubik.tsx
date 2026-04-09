import localFont from "next/font/local";

export const Rubik = localFont({
  src: [
    {
      path: "./Rubik-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Rubik-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "fallback",
  variable: "--font-rubik",
});
