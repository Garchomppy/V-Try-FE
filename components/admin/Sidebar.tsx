import Link from "next/link";
import LogoutButton from "@/components/account/LogoutButton";

export default function Sidebar() {
  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 min-h-screen p-6 flex flex-col gap-4 bg-white">
      <Link
        href="/admin/products"
        className="text-xs font-bold uppercase tracking-widest mb-6"
      >
        V Try Admin
      </Link>
      <Link href="/admin/products" className="text-sm hover:underline">
        Sản phẩm
      </Link>
      <Link href="/admin/orders" className="text-sm hover:underline">
        Đơn hàng
      </Link>
      <div className="mt-auto">
        <LogoutButton />
      </div>
    </nav>
  );
}
