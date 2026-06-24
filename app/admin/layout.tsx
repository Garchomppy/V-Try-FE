import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { getCurrentUserRole } from "@/lib/auth/isAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, role } = await getCurrentUserRole();
  if (!userId) redirect("/login");
  if (role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 overflow-y-auto h-screen relative">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[size:20px_20px]" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
