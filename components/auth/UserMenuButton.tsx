"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function UserMenuButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Link
      href={loggedIn ? "/account" : "/login"}
      aria-label="Account"
      className="hover:text-gray-600 hidden sm:block"
    >
      <User className="w-5 h-5" strokeWidth={1.5} />
    </Link>
  );
}
