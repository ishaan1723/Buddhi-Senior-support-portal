import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signUserToken(payload: { userId: string; phone: string; role: string }) {
  return jwt.sign(
    { sub: payload.userId, phone: payload.phone, role: payload.role },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function signAdminToken(adminId: string) {
  return jwt.sign({ sub: adminId, admin: true }, env.ADMIN_JWT_SECRET, { expiresIn: "12h" });
}
