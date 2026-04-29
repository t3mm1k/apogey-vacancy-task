import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ModalChromeFooter, ModalChromeHeader } from "./ModalChrome";
import Button from "./Button";

const meta = {
  title: "UI/ModalChrome",
  tags: ["autodocs"],
} satisfies Meta<object>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderOnly: Story = {
  render: () => (
    <div className="overflow-hidden rounded-xl border border-stroke-med bg-background-none shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]">
      <ModalChromeHeader
        title="Заголовок шторы"
        onBack={() => {}}
        onClose={() => {}}
      />
    </div>
  ),
};

export const HeaderAndFooter: Story = {
  render: () => (
    <div className="overflow-hidden rounded-xl border border-stroke-med bg-background-none shadow-[0px_4px_16px_-4px_rgba(9,18,58,0.1)]">
      <ModalChromeHeader title="Новый пользователь" onClose={() => {}} />
      <div className="bg-background-none px-8 pb-6 pt-2">
        <p className="text-m text-symb-secondary">
          Контент формы для ручной проверки отступов.
        </p>
      </div>
      <ModalChromeFooter>
        <Button variant="tertiary" size="M" type="button">
          Отмена
        </Button>
        <Button variant="primary" size="M" type="button">
          Сохранить
        </Button>
      </ModalChromeFooter>
    </div>
  ),
};
