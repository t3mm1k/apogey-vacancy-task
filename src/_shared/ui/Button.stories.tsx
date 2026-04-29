import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "tertiary"],
    },
    size: {
      control: "select",
      options: ["L", "M", "S"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryM: Story = {
  args: {
    variant: "primary",
    size: "M",
    children: "Кнопка",
    disabled: false,
  },
};

export const PrimaryL: Story = {
  args: {
    variant: "primary",
    size: "L",
    children: "Создать",
  },
};

export const PrimaryS: Story = {
  args: {
    variant: "primary",
    size: "S",
    children: "OK",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    size: "M",
    children: "Отмена",
  },
};

export const Default: Story = {
  args: {
    variant: "default",
    size: "M",
    children: "Без стиля",
  },
};

export const DisabledPrimary: Story = {
  args: {
    variant: "primary",
    size: "M",
    children: "Недоступно",
    disabled: true,
  },
};
