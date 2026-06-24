import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { getOrdersByUserId } from "@/lib/db/orders";
import { getAllPromotions } from "@/lib/db/promotions";
import AccountTabs from "@/components/account/AccountTabs";
import LogoutButton from "@/components/account/LogoutButton";

export default async function AccountPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [profile, orders, allPromotions] = await Promise.all([
    getProfile(data.user.id),
    getOrdersByUserId(data.user.id),
    getAllPromotions(),
  ]);

  const activePromotions = allPromotions.filter((p) => p.isActive);

  // Lấy chữ cái đầu làm Avatar
  const initial = profile?.fullName
    ? profile.fullName.trim().charAt(0).toUpperCase()
    : data.user.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animate-in fade-in duration-500">
      {/* Header chào mừng cao cấp */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full filter blur-[80px] opacity-25" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-bold tracking-wider">
            {initial}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
              Xin chào, {profile?.fullName || data.user.email}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1">
              Thành viên thân thiết V-Try
            </p>
          </div>
        </div>
        
        <div className="relative z-10 shrink-0">
          <LogoutButton className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-semibold tracking-wider transition-all" />
        </div>
      </div>

      <AccountTabs
        profile={
          profile ?? { id: data.user.id, fullName: null, phone: null, address: null }
        }
        orders={orders}
        promotions={activePromotions}
      />
    </div>
  );
}
