import { Router } from "express";
import { history, triggerSos, getUserContacts, createUserContact, deleteUserContact } from "../controllers/sos.controller.js";
import { optionalUser, requireUser } from "../middleware/auth.js";
import { sosLimiter } from "../middleware/rate-limit.js";
import { validateBody } from "../middleware/validate.js";
import { triggerSosSchema } from "../validators/sos.schema.js";
import { emergencyContactSchema } from "../validators/vendor.schema.js";

export const sosRouter = Router();

sosRouter.post("/trigger", sosLimiter, optionalUser, validateBody(triggerSosSchema), triggerSos);
sosRouter.get("/history", requireUser, history);
sosRouter.get("/contacts", requireUser, getUserContacts);
sosRouter.post("/contacts", requireUser, validateBody(emergencyContactSchema.omit({ userId: true })), createUserContact);
sosRouter.delete("/contacts/:id", requireUser, deleteUserContact);
