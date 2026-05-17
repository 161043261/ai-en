import { Hono } from "hono";
import type { HonoContext } from "../../types/index.js";
import { createUserAuthRouter } from "./auth-routes.js";
import { createUserProfileRouter } from "./profile-routes.js";

const userRouter = new Hono<HonoContext>();

userRouter.route("/", createUserAuthRouter());
userRouter.route("/", createUserProfileRouter());

export default userRouter;
