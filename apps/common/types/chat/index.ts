// 角色
export type ChatRole = "human" | "ai";

export type ChatRoleType = "normal" | "master" | "business";

// reasoning: 推理, chat: 聊天
export type ChatMessageType = "reasoning" | "chat";

export type ChatMessage = {
  role: ChatRole;
  content: string; // chat 聊天内容
  reasoning?: string; // reasoning 推理内容
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
  deepThink: boolean; // 深度思考
  webSearch: boolean; // 联网搜索
  role: ChatRoleType;
  content: string;
  userId: string;
};
