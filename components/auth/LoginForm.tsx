"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    // Check role before redirecting
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .maybeSingle();
    if (profileData?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/account");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto">
      <div>
        <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider mb-1">Email</label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider mb-1">Mật khẩu</label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
