import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import SignupForm from "@/components/auth/SignupForm";

export default async function SignupPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-screen">
      {/* Cột trái: Brand Banner (Chỉ hiện trên desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-neutral-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-neutral-900 to-slate-900 opacity-90 z-0" />
        
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full filter blur-[128px] opacity-20 z-0 animate-pulse duration-[10s]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20 z-0 animate-pulse duration-[8s]" />

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
            Quay lại trang chủ
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            Join the Club
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            THAM GIA V-TRY
          </h1>
          <p className="text-lg text-neutral-300">
            Tạo tài khoản ngay hôm nay để nhận được các ưu đãi đặc quyền, lưu trữ kích thước cơ thể của bạn và thử đồ ảo không giới hạn.
          </p>
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-200">Miễn phí đăng ký thành viên</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-200">Bảo mật thông tin mua sắm tuyệt đối</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} V-Try. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Form Đăng ký */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center md:text-left">
            <div className="md:hidden mb-6 flex justify-center">
              <span className="text-xl font-bold uppercase tracking-widest text-black">V-TRY</span>
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Tạo tài khoản mới
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Hãy điền thông tin bên dưới để đăng ký tài khoản V-Try
            </p>
          </div>

          <div className="bg-neutral-50/50 p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <SignupForm />
          </div>

          <div className="text-center text-sm text-neutral-500">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
