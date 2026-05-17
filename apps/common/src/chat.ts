export type ChatRole = "human" | "ai";
export type ChatRoleType =
  | "normal"
  | "master"
  | "business"
  | "lark"
  | "hangtiancheng";
export type ChatMessageType = "reasoning" | "chat";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  reasoning?: string;
  type: ChatMessageType;
};

export type ChatMessageList = ChatMessage[];

export type ChatMode = {
  label: string;
  id: string;
  role: ChatRoleType;
};

export type ChatModeList = ChatMode[];

export type ChatDto = {
  deepThink: boolean;
  webSearch: boolean;
  role: ChatRoleType;
  content: string;
  userId: string;
};
