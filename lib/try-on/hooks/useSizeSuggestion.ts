"use client";

import { useState } from "react";
import type {
  SizeSuggestion,
  SizeSuggestionRequest,
} from "@/lib/try-on/claude/schema";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SizeSuggestion }
  | { status: "error"; message: string };

export function useSizeSuggestion() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit(req: SizeSuggestionRequest) {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/size-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: json.error ?? "Lỗi không xác định." });
        return;
      }
      setState({ status: "success", data: json as SizeSuggestion });
    } catch {
      setState({ status: "error", message: "Không kết nối được server." });
    }
  }

  function reset() {
    setState({ status: "idle" });
  }

  return { state, submit, reset };
}
