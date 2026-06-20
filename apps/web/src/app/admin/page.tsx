import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="page-shell max-w-6xl">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <AdminDashboard />
    </div>
  );
}
