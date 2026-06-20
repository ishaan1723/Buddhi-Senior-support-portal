"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function LoginForm() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestOtp(formData: FormData) {
    const nextPhone = String(formData.get("phone") || "");
    setError("");
    setMessage("");
    try {
      await apiFetch("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone: nextPhone, fullName: formData.get("fullName") || undefined })
      });
      setPhone(nextPhone);
      setStep("otp");
      setMessage("OTP sent to your phone.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    }
  }

  async function verifyOtp(formData: FormData) {
    setError("");
    setMessage("");
    try {
      const result = await apiFetch<{ token: string; user: { phone: string; fullName: string } }>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code: formData.get("code") })
      });
      window.localStorage.setItem("buddhi_token", result.token);
      window.localStorage.setItem("buddhi_phone", result.user.phone);
      window.localStorage.setItem("buddhi_name", result.user.fullName);
      setMessage("You are logged in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify OTP");
    }
  }

  return (
    <div className="panel mt-5">
      {step === "phone" ? (
        <form action={requestOtp}>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input className="input" id="fullName" name="fullName" />
          <label className="label mt-4" htmlFor="phone">
            Mobile number
          </label>
          <input className="input" id="phone" name="phone" inputMode="tel" required />
          <button className="touch-button mt-5 w-full bg-trust text-white" type="submit">
            Send OTP
          </button>
        </form>
      ) : (
        <form action={verifyOtp}>
          <label className="label" htmlFor="code">
            OTP code
          </label>
          <input className="input" id="code" name="code" inputMode="numeric" minLength={6} maxLength={6} required />
          <button className="touch-button mt-5 w-full bg-trust text-white" type="submit">
            Verify OTP
          </button>
        </form>
      )}
      {message ? <p className="mt-4 rounded-md bg-green-50 p-3 font-semibold text-leaf">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
