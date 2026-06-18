import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { getOrdersByUserId } from "@/lib/db/orders";
import AccountProfileForm from "@/components/account/AccountProfileForm";
import OrderHistoryList from "@/components/account/OrderHistoryList";
import LogoutButton from "@/components/account/LogoutButton";

export default async function AccountPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [profile, orders] = await Promise.all([
    getProfile(data.user.id),
    getOrdersByUserId(data.user.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest">Tài khoản</h1>
        <LogoutButton />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <section className="flex-1">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">
            Thông tin cá nhân
          </h2>
          <AccountProfileForm
            profile={
              profile ?? { id: data.user.id, fullName: null, phone: null, address: null }
            }
          />
        </section>

        <section className="flex-1">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">
            Lịch sử đơn hàng
          </h2>
          <OrderHistoryList orders={orders} />
        </section>
      </div>
    </div>
  );
}
