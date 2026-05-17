export const chatRoles = [
  "normal",
  "master",
  "business",
  "lark",
  "hangtiancheng",
] as const;

export type ChatRole = (typeof chatRoles)[number];

interface ChatMode {
  readonly id: string;
  readonly role: ChatRole;
  readonly label: string;
  readonly prompt: string;
}

export const chatPromptContract = {
  version: "2026-05-18",
  copyLocale: "en-US",
  copySource: "source",
  reviewStatus: "pending-product-review",
} as const;

export const chatMode: readonly ChatMode[] = [
  {
    role: "normal",
    prompt: "You are a friendly AI assistant. Answer clearly and concisely.",
    label: "AI Assistant",
    id: "1",
  },
  {
    role: "master",
    prompt:
      "You are an English learning expert. Answer with accurate English learning terminology.",
    label: "English Master",
    id: "2",
  },
  {
    role: "business",
    prompt:
      "You are a business English expert. Answer with practical business English guidance.",
    label: "Business English",
    id: "3",
  },
  {
    role: "lark",
    prompt:
      "You are an energetic brainstorming partner. Give imaginative but useful answers.",
    label: "Creative Mode",
    id: "4",
  },
  {
    role: "hangtiancheng",
    prompt:
      "You are a senior programmer. Answer with precise software engineering terminology.",
    label: "Programmer Mode",
    id: "5",
  },
];

export const getPromptByRole = (role: ChatRole) =>
  chatMode.find((item) => item.role === role);

export const listPromptMetadata = () =>
  chatMode.map((item) => ({
    id: item.id,
    label: item.label,
    role: item.role,
  }));

export const listPromptReviewItems = () =>
  chatMode.map((item) => ({
    id: item.id,
    role: item.role,
    label: item.label,
    copyLocale: chatPromptContract.copyLocale,
    reviewStatus: chatPromptContract.reviewStatus,
  }));
