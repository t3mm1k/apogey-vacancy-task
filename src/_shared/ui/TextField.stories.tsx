import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextField from "./TextField";

const meta = {
  title: "UI/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: {
    placeholder: "Введите значение",
    label: "Подпись поля",
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: "Значение в поле",
  },
};

export const RequiredError: Story = {
  args: {
    label: "Обязательное поле",
    requiredMark: true,
    error: "Обязательное поле",
    defaultValue: "",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Только просмотр",
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    placeholder: "Без подписи",
  },
};
