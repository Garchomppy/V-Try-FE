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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
