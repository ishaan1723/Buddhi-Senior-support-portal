"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function ReviewForm({ vendorId }: { vendorId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    setError("");
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          vendorId,
          rating: Number(formData.get("rating")),
          comment: formData.get("comment") || undefined
        })
      });
      setMessage("Thank you. Your feedback has been submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review");
    }
  }

  return (
    <form action={submit} className="panel mt-5">
      <h2 className="text-xl font-bold">Submit feedback</h2>
      <div className="mt-4">
        <label className="label" htmlFor="rating">
          Star rating
        </label>
        <select className="input" id="rating" name="rating" defaultValue="5">
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="comment">
          Comment
        </label>
        <textarea className="input min-h-28 py-3" id="comment" name="comment" />
      </div>
      {message ? <p className="mt-4 rounded-md bg-green-50 p-3 font-semibold text-leaf">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 font-semibold text-danger">{error}</p> : null}
      <button className="touch-button mt-5 w-full bg-leaf text-white" type="submit">
        Submit Review
      </button>
    </form>
  );
}
