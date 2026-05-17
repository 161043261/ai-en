import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState, ErrorState, LoadingState } from ".";

const meta = {
  title: "Shared/States",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Empty: Story = {
  render: () => <EmptyState />,
};

export const Error: Story = {
  render: () => <ErrorState />,
};

export const Loading: Story = {
  render: () => <LoadingState />,
};
