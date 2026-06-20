import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { verifyOrigin } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/error-handler.js";
import { generalLimiter } from "./middleware/rate-limit.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { bookingRouter } from "./routes/booking.routes.js";
import { reviewRouter } from "./routes/review.routes.js";
import { sosRouter } from "./routes/sos.routes.js";
import { vendorRouter } from "./routes/vendor.routes.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(morgan("tiny"));
app.use(generalLimiter);
app.use(verifyOrigin);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "buddhi-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/sos", sosRouter);
app.use("/api/vendors", vendorRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);
