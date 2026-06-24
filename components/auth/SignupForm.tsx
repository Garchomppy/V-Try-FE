"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-xs font-bold uppercase tracking-widest text-gray-700"
          >
            Email
          </label>
          <div className="relative">
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email"
              className="w-full border-b-2 border-gray-200 bg-transparent px-0 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-bold uppercase tracking-widest text-gray-700"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
              className="w-full border-b-2 border-gray-200 bg-transparent pr-10 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-bold uppercase tracking-widest text-gray-700"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full border-b-2 border-gray-200 bg-transparent pr-10 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-in fade-in">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full bg-black text-white py-3.5 uppercase font-bold tracking-widest text-sm hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 overflow-hidden flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang xử lý...
          </>
        ) : (
          <>
            Đăng ký
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
