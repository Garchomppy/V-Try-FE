"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className, children }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={className || "text-xs underline hover:text-black"}
    >
      {children || "Đăng xuất"}
    </button>
  );
}
