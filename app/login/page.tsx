import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold uppercase tracking-widest text-center mb-8">
        Đăng nhập
      </h1>
      <LoginForm />
      <p className="text-center text-sm text-gray-500 mt-6">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="underline hover:text-black">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
