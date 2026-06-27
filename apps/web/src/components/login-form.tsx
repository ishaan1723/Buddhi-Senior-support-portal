"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize invisible Recaptcha Verifier on component mount
    if (typeof window !== "undefined" && auth && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          }
        });
      } catch (err) {
        console.error("Failed to initialize recaptcha", err);
      }
    }

    return () => {
      // Clean up verifier
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formattedPhone = phone.trim();
    if (!formattedPhone) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    if (!auth) {
      setError("Firebase Authentication is not configured. Please set NEXT_PUBLIC_FIREBASE_API_KEY.");
      setLoading(false);
      return;
    }

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible"
        });
      }

      // Trigger Firebase SMS OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      setMessage("Verification code sent to your phone via SMS.");
    } catch (err: any) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to send OTP. Ensure the phone number includes the country code (e.g. +91).");
      
      // Reset Recaptcha on failure
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const code = String(formData.get("code") || "").trim();

    if (!code) {
      setError("Please enter the verification code");
      setLoading(false);
      return;
    }

    try {
      const confirmationResult = confirmationResultRef.current;
      if (!confirmationResult) {
        throw new Error("No active verification session. Please request OTP again.");
      }

      // Verify code locally with Firebase
      const credential = await confirmationResult.confirm(code);
      const user = credential.user;
      
      // Retrieve JWT ID token from verified Firebase session
      const idToken = await user.getIdToken();

      // Submit token to local backend to create/login user session
      const result = await apiFetch<{ token: string; user: { phone: string; fullName: string } }>("/api/auth/firebase", {
        method: "POST",
        body: JSON.stringify({ idToken, fullName: fullName || undefined })
      });

      // Save local auth session
      window.localStorage.setItem("buddhi_token", result.token);
      window.localStorage.setItem("buddhi_phone", result.user.phone);
      window.localStorage.setItem("buddhi_name", result.user.fullName);

      setMessage("You are successfully logged in.");
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Incorrect verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel mt-5">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp}>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input 
            className="input" 
            id="fullName" 
            name="fullName" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
          <label className="label mt-4" htmlFor="phone">
            Mobile number (include country code, e.g. +91)
          </label>
          <input 
            className="input" 
            id="phone" 
            name="phone" 
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            required 
          />
          <button 
            className="touch-button mt-5 w-full bg-trust text-white disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <label className="label" htmlFor="code">
            OTP code
          </label>
          <input 
            className="input" 
            id="code" 
            name="code" 
            inputMode="numeric" 
            minLength={6} 
            maxLength={6} 
            required 
          />
          <button 
            className="touch-button mt-5 w-full bg-trust text-white disabled:opacity-50" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
      {message ? <p className="mt-4 rounded-md bg-green-50 p-3 font-semibold text-leaf">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
