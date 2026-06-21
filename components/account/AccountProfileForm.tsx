"use client";

import { useState } from "react";
import type { Profile } from "@/lib/db/profiles";

export default function AccountProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address }),
      });
      setSaved(res.ok);
      setError(!res.ok);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="account-fullname" className="block text-xs font-bold uppercase tracking-widest text-slate-700">Họ tên</label>
          <input
            id="account-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none"
            placeholder="Nhập họ và tên"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="account-phone" className="block text-xs font-bold uppercase tracking-widest text-slate-700">Số điện thoại</label>
          <input
            id="account-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none"
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="account-address" className="block text-xs font-bold uppercase tracking-widest text-slate-700">Địa chỉ</label>
          <input
            id="account-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none"
            placeholder="Nhập địa chỉ chi tiết"
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-slate-900 text-white py-3.5 uppercase font-bold tracking-widest text-sm hover:bg-slate-800 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
      >
        {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p>Cập nhật thông tin thành công!</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Có lỗi xảy ra, vui lòng thử lại.</p>
        </div>
      )}
    </form>
  );
}
