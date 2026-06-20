import { Router } from "express";
import * as admin from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  categorySchema,
  adminVendorSchema,
  adminVerificationSchema,
  emergencyContactSchema,
  supportNumberSchema
} from "../validators/vendor.schema.js";
import { history as sosHistory } from "../controllers/sos.controller.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.get("/dashboard", admin.dashboard);
adminRouter.get("/vendors", admin.listAdminVendors);
adminRouter.post("/vendors", validateBody(adminVendorSchema), admin.createVendor);
adminRouter.post("/vendors/:id/approve", admin.approveVendor);
adminRouter.post("/vendors/:id/reject", admin.rejectVendor);
adminRouter.put("/vendors/:id/verification", validateBody(adminVerificationSchema), admin.updateVerification);
adminRouter.get("/categories", admin.listCategories);
adminRouter.post("/categories", validateBody(categorySchema), admin.createCategory);
adminRouter.get("/sos", sosHistory);
adminRouter.get("/bookings", admin.listBookings);
adminRouter.patch("/bookings/:id/status", admin.updateBookingStatus);
adminRouter.get("/emergency-contacts", admin.listEmergencyContacts);
adminRouter.post("/emergency-contacts", validateBody(emergencyContactSchema), admin.createEmergencyContact);
adminRouter.put("/emergency-contacts/:id", validateBody(emergencyContactSchema.partial()), admin.updateEmergencyContact);
adminRouter.get("/support-numbers", admin.listSupportNumbers);
adminRouter.post("/support-numbers", validateBody(supportNumberSchema), admin.createSupportNumber);
adminRouter.put("/support-numbers/:id", validateBody(supportNumberSchema.partial()), admin.updateSupportNumber);
adminRouter.get("/feedback", admin.listFeedback);
