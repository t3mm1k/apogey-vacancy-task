import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  BodyL,
  BodyM,
  BodyS,
  BodyXs,
  H0,
  H1,
  H2,
  MetaCaption,
} from "./typography";

const meta = {
  title: "UI/Typography",
  tags: ["autodocs"],
} satisfies Meta<object>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <MetaCaption>H0 — заголовок экрана</MetaCaption>
        <H0>Заголовок H0</H0>
      </div>
      <div>
        <MetaCaption>H1</MetaCaption>
        <H1>Заголовок H1</H1>
      </div>
      <div>
        <MetaCaption>H2</MetaCaption>
        <H2>Заголовок H2</H2>
      </div>
      <div>
        <MetaCaption>Body L</MetaCaption>
        <BodyL>Текст размером L — основной абзац.</BodyL>
      </div>
      <div>
        <MetaCaption>Body M</MetaCaption>
        <BodyM>Подпись к полю и вторичный текст.</BodyM>
      </div>
      <div>
        <MetaCaption>Body S</MetaCaption>
        <BodyS>Вспомогательная строка.</BodyS>
      </div>
      <div>
        <MetaCaption>Body XS</MetaCaption>
        <BodyXs>Мелкая метка.</BodyXs>
      </div>
    </div>
  ),
};
