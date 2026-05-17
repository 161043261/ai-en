import { z } from "zod";

export const ChatRoleTypeSchema = z.enum([
  "normal",
  "master",
  "business",
  "lark",
  "hangtiancheng",
]);

export const ChatModeSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: ChatRoleTypeSchema,
});

export const ChatMessageSchema = z.object({
  content: z.string(),
  reasoning: z.string().optional(),
  role: z.enum(["human", "ai"]),
  type: z.enum(["reasoning", "chat"]),
});

export const ChatDtoSchema = z.object({
  content: z.string().min(1),
  deepThink: z.boolean(),
  role: ChatRoleTypeSchema,
  userId: z.string().min(1),
  webSearch: z.boolean(),
});

export const ChatModeListSchema = z.array(ChatModeSchema);
export const ChatMessageListSchema = z.array(ChatMessageSchema);

export type ChatDto = z.infer<typeof ChatDtoSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatMessageList = z.infer<typeof ChatMessageListSchema>;
export type ChatMode = z.infer<typeof ChatModeSchema>;
export type ChatModeList = z.infer<typeof ChatModeListSchema>;
export type ChatRoleType = z.infer<typeof ChatRoleTypeSchema>;
