import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Word } from "../../shared/api/word-schema";
import { SpellingGrid } from "./spelling-grid";
import { createSpellingCells } from "./spelling-state";
import { WordDetailCard } from "./word-detail-card";

const word: Word = {
  createdAt: "2026-05-17T00:00:00.000Z",
  definition: "To improve a skill through repeated practice.",
  id: "word-1",
  phonetic: "/prektis/",
  translation: "A focused exercise that helps build fluency.",
  updatedAt: "2026-05-17T00:00:00.000Z",
  word: "practice",
};

const meta = {
  title: "Features/Learning",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const PracticeStep: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <WordDetailCard
        isHidden={false}
        toggleHidden={() => undefined}
        word={word}
      />
      <SpellingGrid
        cells={createSpellingCells("ai")}
        updateCell={() => undefined}
      />
    </div>
  ),
};
