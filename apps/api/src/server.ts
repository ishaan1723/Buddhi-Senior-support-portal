import { app } from "./app.js";
import { env } from "./config/env.js";
import { startNotificationRetryWorker } from "./services/notification-retry.service.js";

app.listen(env.API_PORT, () => {
  console.log(`Buddhi API listening on ${env.API_PORT}`);
  startNotificationRetryWorker();
});
