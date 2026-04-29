import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Icon from "./Icon";

const names = [
  "chevron_forward",
  "keyboard_arrow_down",
  "close",
  "error",
  "keyboard_backspace",
  "unfold_more",
] as const;

const meta = {
  title: "UI/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: {
    name: "chevron_forward",
    size: 20 as const,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Grid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {names.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} />
          <span className="max-w-[140px] break-all text-center text-xs text-symb-secondary">
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};
