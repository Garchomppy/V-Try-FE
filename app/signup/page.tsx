import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import SignupForm from "@/components/auth/SignupForm";

export default async function SignupPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold uppercase tracking-widest text-center mb-8">
        Đăng ký
      </h1>
      <SignupForm />
      <p className="text-center text-sm text-gray-500 mt-6">
        Đã có tài khoản?{" "}
        <Link href="/login" className="underline hover:text-black">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
