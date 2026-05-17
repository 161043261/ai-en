import { Hono } from "hono";
import type { HonoContext } from "../../types/index.js";
import { createEventTrackerRouter } from "./event-routes.js";
import { createVisitorTrackerRouter } from "./visitor-routes.js";

const trackerRouter = new Hono<HonoContext>();

trackerRouter.route("/", createVisitorTrackerRouter());
trackerRouter.route("/", createEventTrackerRouter());

export default trackerRouter;
