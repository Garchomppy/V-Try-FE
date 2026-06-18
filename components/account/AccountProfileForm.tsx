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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label htmlFor="account-fullname" className="block text-xs font-semibold uppercase tracking-wider mb-1">Họ tên</label>
        <input
          id="account-fullname"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>
      <div>
        <label htmlFor="account-phone" className="block text-xs font-semibold uppercase tracking-wider mb-1">Số điện thoại</label>
        <input
          id="account-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>
      <div>
        <label htmlFor="account-address" className="block text-xs font-semibold uppercase tracking-wider mb-1">Địa chỉ</label>
        <input
          id="account-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-black text-white py-3 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>
      {saved && <p className="text-sm text-green-600">Đã lưu.</p>}
      {error && <p className="text-sm text-red-600">Có lỗi xảy ra, vui lòng thử lại.</p>}
    </form>
  );
}
