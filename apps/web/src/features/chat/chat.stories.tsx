import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChatMessageList as ChatMessages } from "../../shared/api/chat-schema";
import { ChatMessageList } from "./chat-message-list";

const messages: ChatMessages = [
  {
    content: "Can we practice ordering coffee?",
    role: "human",
    type: "chat",
  },
  {
    content: "Absolutely. Try: **Could I have a latte, please?**",
    reasoning: "Guide the learner with a short reusable sentence pattern.",
    role: "ai",
    type: "chat",
  },
];

const meta = {
  title: "Features/Chat",
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Conversation: Story = {
  render: () => <ChatMessageList messages={messages} />,
};
