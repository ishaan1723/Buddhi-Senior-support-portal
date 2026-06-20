import { Router } from "express";
import { history, triggerSos } from "../controllers/sos.controller.js";
import { optionalUser, requireUser } from "../middleware/auth.js";
import { sosLimiter } from "../middleware/rate-limit.js";
import { validateBody } from "../middleware/validate.js";
import { triggerSosSchema } from "../validators/sos.schema.js";

export const sosRouter = Router();

sosRouter.post("/trigger", sosLimiter, optionalUser, validateBody(triggerSosSchema), triggerSos);
sosRouter.get("/history", requireUser, history);
