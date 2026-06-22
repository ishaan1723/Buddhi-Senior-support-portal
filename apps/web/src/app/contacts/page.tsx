"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Phone, Users, Trash2, PlusCircle, AlertCircle, CheckCircle } from "lucide-react";

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relation: "FAMILY" | "NEIGHBOUR" | "DOCTOR" | "LOCAL_RESPONDER" | "SUPPORT_EXECUTIVE";
  priority: number;
};

const importantContacts = [
  ["Emergency Services (National)", "112", "Police, Fire, Ambulance support"],
  ["Mumbai Police (Direct)", "100", "Local Bandra/Khar police response"],
  ["Ambulance Hotline", "108", "State emergency medical transit"],
  ["Buddhi Support Desk", "+912212345678", "Speak directly with concierge"],
  ["Local Responder (Ward)", "+912226422222", "Immediate local support staff"],
  ["BMC H-West Ward Office", "+912226430000", "Bandra ward administrative issues"]
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Form fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState<EmergencyContact["relation"]>("FAMILY");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = window.localStorage.getItem("buddhi_token");
    if (token) {
      setIsLoggedIn(true);
      void fetchEmergencyContacts(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchEmergencyContacts(token: string) {
    setLoading(true);
    try {
      const data = await apiFetch<EmergencyContact[]>("/api/sos/contacts", { token });
      setContacts(data);
    } catch (err) {
      console.error("Failed to load emergency contacts", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    
    if (name.trim().length < 2) {
      setFormError("Name must be at least 2 characters long.");
      return;
    }
    if (phone.trim().length < 10) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    const token = window.localStorage.getItem("buddhi_token") || "";
    setIsSubmitting(true);
    try {
      await apiFetch("/api/sos/contacts", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          relation,
          priority: contacts.length + 1
        }),
        token
      });
      setFormSuccess("Emergency contact added successfully!");
      setName("");
      setPhone("");
      setRelation("FAMILY");
      void fetchEmergencyContacts(token);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteContact(id: string) {
    if (!confirm("Are you sure you want to remove this emergency contact?")) return;
    const token = window.localStorage.getItem("buddhi_token") || "";
    try {
      await apiFetch(`/api/sos/contacts/${id}`, {
        method: "DELETE",
        token
      });
      void fetchEmergencyContacts(token);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete contact");
    }
  }

  function getRelationLabel(rel: EmergencyContact["relation"]) {
    switch (rel) {
      case "FAMILY": return "Family Member";
      case "NEIGHBOUR": return "Neighbour";
      case "DOCTOR": return "Doctor / Caregiver";
      case "LOCAL_RESPONDER": return "Responder";
      default: return "Contact";
    }
  }

  return (
    <div className="page-shell">
      {/* SECTION 1: IMPORTANT NUMBERS */}
      <h1 className="text-3xl font-black text-ink">Important Contacts</h1>
      <p className="mt-2 text-lg text-gray-700 font-medium">
        Click any contact card below to immediately dial the number from your phone.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {importantContacts.map(([label, phone, desc]) => (
          <a 
            key={label} 
            className="premium-card bg-white border-l-8 border-trust flex items-center justify-between gap-4 active:scale-98 transition-transform" 
            href={`tel:${phone}`}
          >
            <span>
              <span className="block text-xl font-black text-ink">{label}</span>
              <span className="mt-1 block text-base font-bold text-trust">{phone}</span>
              <span className="mt-1 block text-sm text-gray-600">{desc}</span>
            </span>
            <Phone aria-hidden="true" className="h-7 w-7 text-trust shrink-0" />
          </a>
        ))}
      </div>

      {/* SECTION 2: MY FAMILY EMERGENCY CONTACTS */}
      <section className="mt-10 border-t-2 border-gray-200 pt-8">
        <h2 className="text-3xl font-black text-ink flex items-center gap-2">
          <Users className="h-8 w-8 text-saffron" />
          My Emergency Contacts
        </h2>
        <p className="mt-2 text-lg text-gray-700 font-medium">
          Add family members, neighbours, or doctors. They will be alerted via SMS/WhatsApp when you trigger the 3-second hold SOS button.
        </p>

        {!isClient || loading ? (
          <div className="mt-6 text-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-saffron border-t-transparent mx-auto"></div>
            <p className="mt-3 text-base text-gray-700 font-bold">Loading emergency contacts...</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="premium-card bg-[#fdfaf2] border-saffron border-l-8 text-center mt-6 py-6">
            <Users className="h-10 w-10 text-saffron mx-auto" />
            <h3 className="mt-3 text-lg font-black text-ink">Login Required</h3>
            <p className="mt-1 text-gray-700 text-sm">Please log in to manage your custom emergency contacts.</p>
            <a href="/login" className="btn-tactile bg-trust text-white mt-4 inline-flex min-h-12 py-2">
              Go to Login
            </a>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* CONTACTS LIST */}
            <div className="md:col-span-2 grid gap-4">
              {contacts.map((contact) => (
                <article 
                  key={contact.id} 
                  className="premium-card bg-white border-l-8 border-saffron flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="inline-block text-xs font-black bg-amber-50 border border-saffron text-saffron px-2.5 py-0.5 rounded-full uppercase">
                      {getRelationLabel(contact.relation)}
                    </span>
                    <h3 className="mt-2 text-xl font-black text-ink">{contact.name}</h3>
                    <p className="mt-1 text-base text-gray-800 font-semibold">{contact.phone}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="btn-tactile bg-rose-50 border-danger text-danger hover:bg-rose-100 min-h-12 w-12 p-0 flex items-center justify-center shrink-0 shadow-none"
                    aria-label={`Delete ${contact.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </article>
              ))}

              {contacts.length === 0 ? (
                <div className="panel bg-gray-50 border-dashed border-2 py-8 text-center text-gray-500 font-medium">
                  No family contacts saved yet. Use the form to add one.
                </div>
              ) : null}
            </div>

            {/* ADD CONTACT FORM */}
            <div>
              {contacts.length < 3 ? (
                <form onSubmit={handleAddContact} className="premium-card bg-[#fdfaf2] border-trust border-t-8">
                  <h3 className="text-xl font-black text-ink flex items-center gap-1.5">
                    <PlusCircle className="h-5 w-5 text-trust" />
                    Add Contact
                  </h3>
                  
                  {formError ? (
                    <div className="mt-4 flex items-start gap-2 rounded-md bg-rose-50 border border-danger p-3 text-danger text-xs font-bold">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  ) : null}

                  {formSuccess ? (
                    <div className="mt-4 flex items-start gap-2 rounded-md bg-green-50 border border-leaf p-3 text-leaf text-xs font-bold">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{formSuccess}</span>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <label className="label text-xs" htmlFor="name">
                      Full Name
                    </label>
                    <input 
                      className="input min-h-12 text-base px-3" 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="mt-4">
                    <label className="label text-xs" htmlFor="phone">
                      Mobile Number
                    </label>
                    <input 
                      className="input min-h-12 text-base px-3" 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      inputMode="tel" 
                      required 
                    />
                  </div>

                  <div className="mt-4">
                    <label className="label text-xs" htmlFor="relation">
                      Relationship
                    </label>
                    <select 
                      className="input min-h-12 text-base px-3" 
                      id="relation" 
                      value={relation} 
                      onChange={(e) => setRelation(e.target.value as any)}
                    >
                      <option value="FAMILY">Family Member</option>
                      <option value="NEIGHBOUR">Neighbour</option>
                      <option value="DOCTOR">Doctor / Caregiver</option>
                      <option value="LOCAL_RESPONDER">BMC Local Responder</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-tactile bg-trust text-white hover:bg-sky-850 mt-5 w-full text-base min-h-12"
                  >
                    {isSubmitting ? "Adding..." : "Add Emergency Contact"}
                  </button>
                  <p className="mt-3 text-xs text-gray-500 text-center font-medium">
                    Limit of 3 custom emergency contacts.
                  </p>
                </form>
              ) : (
                <div className="premium-card bg-gray-50 border-gray-300 border-t-8 text-center text-gray-600">
                  <CheckCircle className="h-8 w-8 text-gray-400 mx-auto" />
                  <h3 className="mt-3 text-lg font-black text-ink">Contacts Full</h3>
                  <p className="mt-1 text-xs">
                    You have reached the maximum limit of 3 emergency contacts. Delete one to add a new one.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
