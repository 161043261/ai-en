import type { ApiClients } from "./api-clients";
import { createAuthEndpoints, type AuthEndpoints } from "./auth-endpoints";
import { createChatEndpoints, type ChatEndpoints } from "./chat-endpoints";
import {
  createCourseEndpoints,
  type CourseEndpoints,
} from "./course-endpoints";
import { createLearnEndpoints, type LearnEndpoints } from "./learn-endpoints";
import { createPayEndpoints, type PayEndpoints } from "./pay-endpoints";
import { createUserEndpoints, type UserEndpoints } from "./user-endpoints";
import {
  createWordBookEndpoints,
  type WordBookEndpoints,
} from "./word-book-endpoints";
import {
  createWordMarqueeEndpoints,
  type WordMarqueeEndpoints,
} from "./word-marquee-endpoints";

export type AppApi = {
  readonly auth: AuthEndpoints;
  readonly chat: ChatEndpoints;
  readonly course: CourseEndpoints;
  readonly learn: LearnEndpoints;
  readonly pay: PayEndpoints;
  readonly user: UserEndpoints;
  readonly wordBook: WordBookEndpoints;
  readonly wordMarquee: WordMarqueeEndpoints;
};

export function createAppApi(clients: ApiClients): AppApi {
  return {
    auth: createAuthEndpoints(clients.refresh),
    chat: createChatEndpoints(clients.ai),
    course: createCourseEndpoints(clients.server),
    learn: createLearnEndpoints(clients.server),
    pay: createPayEndpoints(clients.server),
    user: createUserEndpoints(clients.server),
    wordBook: createWordBookEndpoints(clients.server),
    wordMarquee: createWordMarqueeEndpoints(clients.server),
  };
}
