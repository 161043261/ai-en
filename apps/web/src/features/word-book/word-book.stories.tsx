import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Word } from "../../shared/api/word-schema";
import { WordCard } from "./word-card";

const word: Word = {
  cet4: true,
  cet6: true,
  createdAt: "2026-05-17T00:00:00.000Z",
  definition: "A clear reason for doing something.",
  id: "word-1",
  phonetic: "/perpes/",
  translation: "**Purpose** means the goal behind an action.",
  updatedAt: "2026-05-17T00:00:00.000Z",
  word: "purpose",
};

const meta = {
  title: "Features/Word Book",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const WordEntry: Story = {
  render: () => (
    <div className="max-w-sm">
      <WordCard word={word} />
    </div>
  ),
};
