"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { X } from "lucide-react";

type Summary = {
  vendorsPending: number;
  vendorsApproved: number;
  sosOpen: number;
  bookingsRequested: number;
  reviewCount: number;
};

type AdminRow = Record<string, unknown> & { id: string; name?: string; fullName?: string; status?: string };

const tabs = [
  ["vendors", "Vendors"],
  ["sos", "SOS Logs"],
  ["bookings", "Bookings"],
  ["emergency-contacts", "Contacts"],
  ["support-numbers", "Support"],
  ["feedback", "Feedback"]
] as const;

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [active, setActive] = useState<(typeof tabs)[number][0]>("vendors");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [error, setError] = useState("");

  // Categories and modals states
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("buddhi_admin_token") || "";
    setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadDashboard(token);
    void loadCategories(token);
  }, [token]);

  async function loadCategories(adminToken = token) {
    try {
      const data = await apiFetch<any[]>("/api/admin/categories", { token: adminToken });
      setCategories(data);
    } catch (err) {
      console.error("Could not load categories", err);
    }
  }

  async function loadDashboard(nextToken = token) {
    setError("");
    try {
      const [nextSummary, nextRows] = await Promise.all([
        apiFetch<Summary>("/api/admin/dashboard", { token: nextToken }),
        apiFetch<AdminRow[]>(`/api/admin/${active}`, { token: nextToken })
      ]);
      setSummary(nextSummary);
      setRows(nextRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin data");
    }
  }

  async function handleCreateCategory(formData: FormData) {
    setError("");
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const description = formData.get("description") as string;

    try {
      await apiFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name, slug, description }),
        token
      });
      setShowAddCategory(false);
      await loadCategories(token);
      await loadDashboard(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    }
  }

  async function handleCreateVendor(formData: FormData) {
    setError("");
    const categoryId = formData.get("categoryId") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const whatsapp = formData.get("whatsapp") as string || phone;
    const address = formData.get("address") as string;
    const locality = formData.get("locality") as string || "H-West Ward";
    const description = formData.get("description") as string;
    const yearsExperienceStr = formData.get("yearsExperience") as string;
    const yearsExperience = yearsExperienceStr ? parseInt(yearsExperienceStr, 10) : undefined;

    try {
      await apiFetch("/api/admin/vendors", {
        method: "POST",
        body: JSON.stringify({ categoryId, name, phone, whatsapp, address, locality, description, yearsExperience }),
        token
      });
      setShowAddVendor(false);
      await loadDashboard(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create vendor");
    }
  }

  async function login(formData: FormData) {
    setError("");
    try {
      const result = await apiFetch<{ token: string }>("/api/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") })
      });
      window.localStorage.setItem("buddhi_admin_token", result.token);
      setToken(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not login");
    }
  }

  function handleSignOut() {
    window.localStorage.removeItem("buddhi_admin_token");
    setToken("");
    setSummary(null);
    setRows([]);
  }

  async function switchTab(tab: (typeof tabs)[number][0]) {
    setActive(tab);
    if (!token) return;
    setError("");
    try {
      setRows(await apiFetch<AdminRow[]>(`/api/admin/${tab}`, { token }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tab");
    }
  }

  async function toggleCheck(vendorId: string, currentChecklist: Record<string, string>, field: string, value: "PASSED" | "FAILED" | "PENDING") {
    const updated = {
      identityVerified: currentChecklist?.identityVerified || "PENDING",
      addressVerified: currentChecklist?.addressVerified || "PENDING",
      licenseVerified: currentChecklist?.licenseVerified || "PENDING",
      referencesChecked: currentChecklist?.referencesChecked || "PENDING",
      serviceQualityApproved: currentChecklist?.serviceQualityApproved || "PENDING",
      [field]: value
    };
    setError("");
    try {
      await apiFetch(`/api/admin/vendors/${vendorId}/verification`, {
        method: "PUT",
        body: JSON.stringify(updated),
        token
      });
      await switchTab("vendors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update checklist");
    }
  }

  async function updateBooking(id: string, nextStatus: string) {
    setError("");
    try {
      await apiFetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
        token
      });
      await switchTab("bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking status");
    }
  }

  async function vendorAction(id: string, action: "approve" | "reject") {
    setError("");
    try {
      await apiFetch(`/api/admin/vendors/${id}/${action}`, { method: "POST", body: "{}", token });
      await switchTab("vendors");
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${action} vendor`);
    }
  }

  function getRowTitle(row: AdminRow) {
    switch (active) {
      case "feedback": {
        const user = (row.user as Record<string, string>) || {};
        const vendor = (row.vendor as Record<string, string>) || {};
        return `Feedback for ${vendor.name || "Vendor"} by ${user.fullName || "Member"}`;
      }
      case "emergency-contacts": {
        const user = (row.user as Record<string, string>) || {};
        return `Emergency Contact for ${user.fullName || "Member"}`;
      }
      case "support-numbers": {
        return String(row.label || "Support Line");
      }
      default:
        return String(row.name || row.fullName || row.id);
    }
  }

  function renderAdminRow(row: AdminRow) {
    switch (active) {
      case "vendors": {
        const category = (row.category as Record<string, string>) || {};
        const checklist = (row.checklist as Record<string, string>) || {};
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-trust/10 text-trust font-black px-2 py-0.5 rounded">
                {category.name || "Service"}
              </span>
              {row.buddhiVerified ? (
                <span className="text-xs font-bold bg-green-50 text-leaf border border-leaf px-2 py-0.5 rounded">
                  ✓ Buddhi Verified
                </span>
              ) : (
                <span className="text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                  Unverified
                </span>
              )}
            </div>
            <p className="text-lg text-gray-800 font-medium mt-1">{row.description as string}</p>
            <div className="text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span>📞 <strong>Phone:</strong> {row.phone as string}</span>
              <span>📍 <strong>Address:</strong> {row.address as string} ({row.locality as string})</span>
              {row.yearsExperience ? <span>💼 <strong>Exp:</strong> {String(row.yearsExperience)} years</span> : null}
            </div>

            {/* 5-POINT CHECKLIST CONTROLLER */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-ink mb-2">5-Point Verification Checklist:</h3>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                {[
                  ["identityVerified", "Identity"],
                  ["addressVerified", "Address"],
                  ["licenseVerified", "License"],
                  ["referencesChecked", "References"],
                  ["serviceQualityApproved", "Quality"]
                ].map(([field, label]) => {
                  const status = checklist[field as string] || "PENDING";
                  return (
                    <div key={field as string} className="flex flex-col gap-1 rounded border border-gray-200 p-2 bg-gray-50">
                      <span className="text-xs font-bold text-gray-700">{label}</span>
                      <select
                        value={status}
                        onChange={(e) => toggleCheck(row.id, checklist, field as string, e.target.value as any)}
                        className={`text-xs font-bold p-1 rounded border select-none ${
                          status === "PASSED"
                            ? "bg-green-50 border-leaf text-leaf"
                            : status === "FAILED"
                            ? "bg-red-50 border-danger text-danger"
                            : "bg-white border-gray-300 text-gray-800"
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      case "sos": {
        const notifications = (row.notifications as any[]) || [];
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-danger/10 text-danger font-black px-2 py-0.5 rounded animate-pulse">
                Emergency Alert
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                row.status === "RESOLVED"
                  ? "bg-green-50 border-leaf text-leaf"
                  : "bg-red-50 border-danger text-danger"
              }`}>
                {String(row.status)}
              </span>
            </div>
            <div className="text-sm text-gray-800 flex flex-col gap-1 mt-1">
              <span>🚨 <strong>Senior Citizen Phone:</strong> {row.phone as string}</span>
              <span>📅 <strong>Triggered At:</strong> {new Date(row.triggeredAt as string).toLocaleString()}</span>
              {row.addressHint ? <span>📍 <strong>Location:</strong> {row.addressHint as string}</span> : null}
              {row.notes ? <span>📝 <strong>Notes:</strong> {row.notes as string}</span> : null}
            </div>
            {notifications.length > 0 ? (
              <div className="mt-3 border-t border-gray-100 pt-2">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Alert Recipients:</h4>
                <div className="grid gap-2 sm:grid-cols-2 mt-1">
                  {notifications.map((notif: any) => (
                    <div key={notif.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span>{notif.recipientName} ({notif.channel})</span>
                        <span className={notif.status === "SENT" ? "text-leaf" : "text-danger"}>{notif.status}</span>
                      </div>
                      <div className="text-gray-600 mt-0.5">{notif.recipientPhone}</div>
                      {notif.lastError ? <div className="text-danger mt-0.5">Err: {notif.lastError}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      }
      case "bookings": {
        const vendor = (row.vendor as Record<string, string>) || {};
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-saffron/10 text-saffron font-black px-2 py-0.5 rounded">
                Booking Request
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                row.status === "COMPLETED"
                  ? "bg-green-50 border-leaf text-leaf"
                  : "bg-blue-50 border-trust text-trust"
              }`}>
                {String(row.status)}
              </span>
            </div>
            <div className="text-sm text-gray-800 flex flex-col gap-1 mt-1">
              <span>👤 <strong>Client:</strong> {row.requesterName as string} ({row.requesterPhone as string})</span>
              <span>💼 <strong>Service:</strong> {vendor.name || "Provider"}</span>
              {row.preferredTime ? <span>📅 <strong>Time:</strong> {new Date(row.preferredTime as string).toLocaleString()}</span> : null}
              {row.notes ? <span>📝 <strong>Notes:</strong> {row.notes as string}</span> : null}
            </div>

            {/* Change status controls */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {["CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => updateBooking(row.id, statusOption)}
                  className="touch-button bg-gray-100 border border-gray-300 px-3 py-1 text-xs rounded hover:bg-gray-200"
                >
                  Mark {statusOption.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        );
      }
      case "emergency-contacts": {
        const user = (row.user as Record<string, string>) || {};
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-trust/10 text-trust font-black px-2 py-0.5 rounded">
                Emergency Contact
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                row.isActive ? "bg-green-50 border-leaf text-leaf" : "bg-gray-50 border-gray-300 text-gray-500"
              }`}>
                {row.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-sm text-gray-855 flex flex-col gap-1 mt-1">
              <span>👤 <strong>Contact Name:</strong> {row.name as string} ({row.relation as string})</span>
              <span>📞 <strong>Contact Phone:</strong> {row.phone as string}</span>
              <span>👴 <strong>For Senior:</strong> {user.fullName || "Buddhi Member"} ({user.phone || "Unknown"})</span>
              <span>🚨 <strong>Priority:</strong> Level {String(row.priority)}</span>
              <span>💬 <strong>Channels:</strong> {row.canReceiveSms ? "SMS " : ""}{row.canReceiveWhatsapp ? "• WhatsApp" : ""}</span>
            </div>
          </div>
        );
      }
      case "support-numbers": {
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-leaf/10 text-leaf font-black px-2 py-0.5 rounded">
                Support Line
              </span>
              {row.isPrimary ? (
                <span className="text-xs font-bold bg-amber-50 border border-saffron text-saffron px-2 py-0.5 rounded">
                  Primary Helpdesk
                </span>
              ) : null}
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                row.isActive ? "bg-green-50 border-leaf text-leaf" : "bg-gray-50 border-gray-300 text-gray-500"
              }`}>
                {row.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-sm text-gray-855 flex flex-col gap-1 mt-1">
              <span>📞 <strong>Label:</strong> {row.label as string}</span>
              <span>☎️ <strong>Phone Number:</strong> {row.phone as string}</span>
              {row.whatsapp ? <span>💬 <strong>WhatsApp:</strong> {row.whatsapp as string}</span> : null}
            </div>
          </div>
        );
      }
      case "feedback": {
        const vendor = (row.vendor as Record<string, string>) || {};
        const user = (row.user as Record<string, string>) || {};
        const rating = Number(row.rating || 0);
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider bg-saffron/10 text-saffron font-black px-2 py-0.5 rounded">
                Senior Feedback
              </span>
              <span className="text-xs font-black text-saffron flex items-center gap-0.5">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)} ({rating} stars)
              </span>
            </div>
            <p className="text-lg font-bold text-ink mt-1">"{row.comment as string || "No comment provided."}"</p>
            <div className="text-sm text-gray-850 flex flex-col gap-1 mt-1">
              <span>💼 <strong>Vendor:</strong> {vendor.name || "Unknown Vendor"}</span>
              <span>👤 <strong>Reviewed By:</strong> {user.fullName || "Buddhi Member"} ({user.phone || "Unknown"})</span>
              <span>📅 <strong>Date:</strong> {new Date(row.createdAt as string).toLocaleString()}</span>
            </div>
          </div>
        );
      }
      default:
        return <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">{JSON.stringify(row, null, 2)}</pre>;
    }
  }

  if (!token) {
    return (
      <form action={login} className="panel mt-5 max-w-md border-2 border-trust">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="input" id="email" name="email" type="email" required defaultValue="admin@buddhi.local" />
        <label className="label mt-4" htmlFor="password">
          Password
        </label>
        <input className="input" id="password" name="password" type="password" required />
        <button className="touch-button mt-5 w-full bg-trust text-white font-bold text-lg min-h-14" type="submit">
          Admin Login
        </button>
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-danger">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="mt-4">
      {/* Sign Out Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSignOut}
          className="btn-tactile bg-white text-danger hover:bg-red-50 text-sm font-extrabold px-4 py-2 min-h-12 border-2 border-ink shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]"
          type="button"
        >
          🚪 Sign Out
        </button>
      </div>

      {summary ? (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5" aria-label="Admin summary">
          <Metric label="Pending vendors" value={summary.vendorsPending} />
          <Metric label="Approved vendors" value={summary.vendorsApproved} />
          <Metric label="Open SOS" value={summary.sosOpen} />
          <Metric label="Bookings" value={summary.bookingsRequested} />
          <Metric label="Reviews" value={summary.reviewCount} />
        </section>
      ) : null}

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`shrink-0 border-2 font-extrabold rounded-xl transition-all duration-150 select-none min-h-11 px-4 py-2 text-sm sm:min-h-14 sm:px-6 sm:py-3 sm:text-lg ${
              active === id ? "border-trust bg-trust text-white shadow-soft" : "border-gray-300 bg-white text-gray-850 hover:bg-gray-50"
            }`}
            onClick={() => switchTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {active === "vendors" && (
        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAddVendor(true)}
            className="touch-button bg-trust text-white hover:bg-sky-850 text-sm font-extrabold px-4 py-2 min-h-12 border-2 border-trust"
            type="button"
          >
            ➕ Add New Vendor
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            className="touch-button bg-white text-trust border-2 border-trust hover:bg-sky-50 text-sm font-extrabold px-4 py-2 min-h-12"
            type="button"
          >
            ➕ Add New Category
          </button>
        </div>
      )}

      {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-danger">{error}</p> : null}
      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="panel border-2 border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-black text-ink">{getRowTitle(row)}</h2>
                <div className="flex items-center gap-2">
                  {row.status ? (
                    <span className="text-xs uppercase tracking-wider bg-saffron/10 text-saffron font-bold px-2 py-0.5 rounded">
                      {String(row.status)}
                    </span>
                  ) : null}
                  {active === "vendors" ? (
                    <div className="flex gap-2">
                      <button className="touch-button bg-leaf text-white text-xs px-3 py-1 font-bold min-h-10" type="button" onClick={() => vendorAction(row.id, "approve")}>
                        Approve
                      </button>
                      <button className="touch-button bg-danger text-white text-xs px-3 py-1 font-bold min-h-10" type="button" onClick={() => vendorAction(row.id, "reject")}>
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {renderAdminRow(row)}
            </div>
          </article>
        ))}
      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border-4 border-ink bg-white p-6 text-ink shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
              <h3 className="text-2xl font-black text-saffron uppercase">Add Category</h3>
              <button
                onClick={() => setShowAddCategory(false)}
                className="rounded-lg border-2 border-gray-300 p-1.5 hover:bg-gray-100"
                type="button"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <form action={handleCreateCategory} className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="cat-name">Category Name</label>
                <input className="input" id="cat-name" name="name" type="text" placeholder="e.g. Physiotherapists" required />
              </div>
              <div>
                <label className="label" htmlFor="cat-slug">URL Slug (lowercase & hyphens)</label>
                <input className="input" id="cat-slug" name="slug" type="text" placeholder="e.g. physiotherapists" pattern="^[a-z0-9-]+$" title="Lowercase, numbers, and hyphens only" />
              </div>
              <div>
                <label className="label" htmlFor="cat-desc">Description</label>
                <textarea className="input min-h-24 py-2" id="cat-desc" name="description" placeholder="Short summary..." />
              </div>
              <button className="touch-button w-full bg-trust text-white font-bold text-lg min-h-14 mt-2 border-2 border-trust" type="submit">
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border-4 border-ink bg-white p-6 text-ink shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
              <h3 className="text-2xl font-black text-saffron uppercase">Add Vendor</h3>
              <button
                onClick={() => setShowAddVendor(false)}
                className="rounded-lg border-2 border-gray-300 p-1.5 hover:bg-gray-100"
                type="button"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <form action={handleCreateVendor} className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="vendor-cat">Category</label>
                <select className="input py-2" id="vendor-cat" name="categoryId" required>
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="vendor-name">Name</label>
                <input className="input" id="vendor-name" name="name" type="text" placeholder="e.g. Dr. Rohan Verma" required />
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="label" htmlFor="vendor-phone">Phone Number</label>
                  <input className="input" id="vendor-phone" name="phone" type="tel" placeholder="e.g. +919820000000" required />
                </div>
                <div>
                  <label className="label" htmlFor="vendor-wa">WhatsApp Phone</label>
                  <input className="input" id="vendor-wa" name="whatsapp" type="tel" placeholder="e.g. +919820000000" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="vendor-addr">Street Address</label>
                <input className="input" id="vendor-addr" name="address" type="text" placeholder="e.g. Linking Road, Khar West" required />
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="label" htmlFor="vendor-loc">Locality</label>
                  <input className="input" id="vendor-loc" name="locality" type="text" defaultValue="H-West Ward" required />
                </div>
                <div>
                  <label className="label" htmlFor="vendor-exp">Years of Experience</label>
                  <input className="input" id="vendor-exp" name="yearsExperience" type="number" min="0" max="80" defaultValue="5" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="vendor-desc">Description of Service</label>
                <textarea className="input min-h-24 py-2" id="vendor-desc" name="description" placeholder="Trusted services description..." required />
              </div>
              <button className="touch-button w-full bg-trust text-white font-bold text-lg min-h-14 mt-2 border-2 border-trust" type="submit">
                Register & Approve Vendor
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel border-2 border-gray-150 !p-4">
      <p className="text-xs sm:text-sm font-bold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-black text-trust">{value}</p>
    </div>
  );
}

