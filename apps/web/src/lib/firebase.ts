import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Safe debug logging to see what config is actually loaded in the browser
if (typeof window !== "undefined") {
  const maskedKey = firebaseConfig.apiKey 
    ? `${firebaseConfig.apiKey.slice(0, 8)}...${firebaseConfig.apiKey.slice(-5)}` 
    : "UNDEFINED";
  console.log("DEBUG [Firebase Config]:", {
    apiKey: maskedKey,
    authDomain: firebaseConfig.authDomain || "UNDEFINED",
    projectId: firebaseConfig.projectId || "UNDEFINED"
  });
}

let app;
let auth: any = null;

if (firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  auth.useDeviceLanguage();
}

export { app, auth };
