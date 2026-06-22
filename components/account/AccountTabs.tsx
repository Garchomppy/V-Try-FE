"use client";

import { useState } from "react";
import { User, ShoppingBag, Tag, Copy, Check } from "lucide-react";
import AccountProfileForm from "./AccountProfileForm";
import OrderHistoryList from "./OrderHistoryList";
import type { Profile } from "@/lib/db/profiles";
import type { OrderRow } from "@/lib/db/orders";
import type { Promotion } from "@/lib/db/promotions";

interface Props {
  profile: Profile;
  orders: OrderRow[];
  promotions: Promotion[];
}

export default function AccountTabs({ profile, orders, promotions }: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "promotions">("profile");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tabs = [
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
    { id: "orders", label: "Đơn hàng của tôi", icon: ShoppingBag, count: orders.length },
    { id: "promotions", label: "Ưu đãi của tôi", icon: Tag, count: promotions.length },
  ] as { id: "profile" | "orders" | "promotions"; label: string; icon: any; count?: number }[];

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-grow min-w-0">
        {activeTab === "profile" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Thông tin cá nhân</h2>
              <p className="text-slate-500 text-sm mt-1">Cập nhật thông tin liên hệ và địa chỉ giao nhận của bạn</p>
            </div>
            <div className="border-t border-slate-100 pt-6">
              <AccountProfileForm profile={profile} />
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Lịch sử đơn hàng</h2>
              <p className="text-slate-500 text-sm mt-1">Theo dõi trạng thái và lịch sử các giao dịch mua hàng</p>
            </div>
            <div className="border-t border-slate-100 pt-6">
              <OrderHistoryList orders={orders} />
            </div>
          </div>
        )}

        {activeTab === "promotions" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ưu đãi dành cho bạn</h2>
              <p className="text-slate-500 text-sm mt-1">Các chương trình ưu đãi độc quyền đang hoạt động</p>
            </div>
            <div className="border-t border-slate-100 pt-6">
              {promotions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Hiện chưa có chương trình ưu đãi nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {promotions.map((promo) => {
                    const mockCode = `VTRY${promo.discountPercentage}`;
                    const isCopied = copiedId === promo.id;
                    return (
                      <div
                        key={promo.id}
                        className="border border-slate-200 rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Lớp trang trí bán nguyệt kiểu Coupon */}
                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border border-slate-200 rounded-full -translate-y-1/2" />
                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full -translate-y-1/2" />

                        <div className="space-y-2">
                          <div className="inline-block bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm border border-indigo-100">
                            Giảm {promo.discountPercentage}%
                          </div>
                          <h3 className="font-bold text-slate-800 text-base">{promo.name}</h3>
                          {promo.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">{promo.description}</p>
                          )}
                        </div>

                        {/* <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-dashed border-slate-200">
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Mã ưu đãi</span>
                            <span className="font-mono text-sm font-bold text-slate-700">{mockCode}</span>
                          </div>
                          <button
                            onClick={() => copyCode(mockCode, promo.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                              isCopied
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Đã lưu
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Lưu mã
                              </>
                            )}
                          </button>
                        </div> */}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
