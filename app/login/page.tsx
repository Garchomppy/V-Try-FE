import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.role === "admin") redirect("/admin");
    redirect("/account");
  }

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-screen">
      {/* Cột trái: Brand Banner (Chỉ hiện trên desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Lớp phủ gradient chéo cao cấp */}
        {/* <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-neutral-900 to-slate-900 opacity-90 z-0" /> */}

        {/* Hình tròn phát sáng nhẹ tạo chiều sâu (Glassmorphism backdrop) */}
        {/* <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full filter blur-[128px] opacity-20 z-0 animate-pulse duration-[10s]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20 z-0 animate-pulse duration-[8s]" /> */}

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group text-sm text-neutral-400 hover:text-white transition-colors">
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            Virtual Try-on Fashion
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            V-TRY FASHION
          </h1>
          <p className="text-lg text-neutral-300">
            Sign in to experience smart virtual try-on technology and explore the latest fashion collections.
          </p>
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.452L21 9l-4.452-8.904L9 9l.813 6.904z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-200">Experience intuitive 3D virtual try-on</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-200">Get early access to exclusive offers and promotions</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} V-Try. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center md:text-left">
            <div className="md:hidden mb-6 flex justify-center">
              <span className="text-xl font-bold uppercase tracking-widest text-black">V-TRY</span>
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Please enter your account information to continue
            </p>
          </div>

          <div className="bg-neutral-50/50 p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <LoginForm />
          </div>

          <div className="text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 underline transition-colors">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
