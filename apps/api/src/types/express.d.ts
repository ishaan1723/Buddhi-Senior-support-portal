export type UserRole = "SENIOR" | "FAMILY" | "SUPPORT";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        phone?: string;
        role?: UserRole;
        adminId?: string;
      };
    }
  }
}

export {};
