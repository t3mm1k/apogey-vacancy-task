import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { useState } from "react";
import { fn } from "storybook/test";

import CodeInput from "./CodeInput";

function Controlled(props: Omit<ComponentProps<typeof CodeInput>, "value" | "onChange">) {
  const [value, setValue] = useState("");
  return <CodeInput {...props} value={value} onChange={setValue} />;
}

function ControlledPreset(props: Omit<ComponentProps<typeof CodeInput>, "value" | "onChange">) {
  const [value, setValue] = useState("11");
  return <CodeInput {...props} value={value} onChange={setValue} />;
}

function DisabledExample() {
  const [value, setValue] = useState("1111");
  return <CodeInput disabled value={value} onChange={setValue} />;
}

const meta = {
  title: "UI/CodeInput",
  component: CodeInput,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof CodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: "",
    onChange: fn(),
  },
  render: () => <Controlled />,
};

export const PartiallyFilled: Story = {
  args: {
    value: "",
    onChange: fn(),
  },
  render: () => <ControlledPreset />,
};

export const ErrorState: Story = {
  args: {
    value: "",
    onChange: fn(),
    error: true,
  },
  render: () => <Controlled error />,
};

export const Disabled: Story = {
  args: {
    value: "",
    onChange: fn(),
    disabled: true,
  },
  render: () => <DisabledExample />,
};
