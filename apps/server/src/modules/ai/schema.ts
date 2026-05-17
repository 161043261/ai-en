import { z } from "zod";
import { chatRoles } from "./prompts.js";

export const chatRoleSchema = z.enum(chatRoles);

export const chatSchema = z.object({
  role: chatRoleSchema,
  content: z.string().min(1),
  userId: z.string().min(1),
  webSearch: z.boolean().optional(),
  deepThink: z.boolean().optional(),
});

export const chatHistoryQuerySchema = z.object({
  userId: z.string().min(1),
  role: chatRoleSchema,
});

export const bochaSearchResponseSchema = z.object({
  data: z
    .object({
      webPages: z
        .object({
          value: z
            .array(
              z.object({
                name: z.string().default(""),
                url: z.string().default(""),
                summary: z.string().nullable().optional(),
                siteName: z.string().default(""),
                siteIcon: z.string().default(""),
                dateLastCrawled: z.string().default(""),
              }),
            )
            .default([]),
        })
        .optional(),
    })
    .optional(),
});

export type ChatRole = z.infer<typeof chatRoleSchema>;
