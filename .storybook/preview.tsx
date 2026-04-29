import type { Preview } from "@storybook/nextjs-vite";

import "../src/_app/globals/lib/css/globals.css";
import "../src/_app/globals/lib/css/material-symbols-outlined.css";

import { Rubik } from "../src/_shared/lib/fonts/rubik/Rubik";
import { MaterialSymbols } from "../src/_shared/lib/fonts/icons/MaterialSymbols";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    layout: "padded",

    a11y: {
      test: "todo"
    }
  },
  decorators: [
    (Story) => (
      <div
        className={`${Rubik.variable} ${MaterialSymbols.variable} fonts-loaded bg-background-min antialiased`}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
