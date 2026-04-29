import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import UserRow from "./UserRow";

const meta = {
  title: "UI/UserRow",
  component: UserRow,
  tags: ["autodocs"],
  args: {
    name: "Тарасова Анастасия Александровна",
  },
} satisfies Meta<typeof UserRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmed: Story = {
  args: {
    confirmed: true,
    onClick: () => {},
  },
};

export const NotConfirmed: Story = {
  args: {
    confirmed: false,
  },
};

export const ConfirmedInteractive: Story = {
  args: {
    confirmed: true,
    onClick: fn(),
  },
};
