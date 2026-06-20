import { Phone } from "lucide-react";

const contacts = [
  ["Emergency", "112"],
  ["Mumbai Police", "100"],
  ["Ambulance", "108"],
  ["Buddhi Support", "+912212345678"],
  ["Local Responder", "+912226422222"],
  ["BMC Ward Office", "+912226430000"]
];

export default function ContactsPage() {
  return (
    <div className="page-shell">
      <h1 className="text-3xl font-bold">Important contacts</h1>
      <div className="mt-5 grid gap-3">
        {contacts.map(([label, phone]) => (
          <a key={label} className="panel flex items-center justify-between gap-4" href={`tel:${phone}`}>
            <span>
              <span className="block text-xl font-bold">{label}</span>
              <span className="mt-1 block text-gray-700">{phone}</span>
            </span>
            <Phone aria-hidden="true" className="h-7 w-7 text-trust" />
          </a>
        ))}
      </div>
    </div>
  );
}
