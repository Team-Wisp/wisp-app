"use client";

import { useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { toast } from "sonner";

export default function AuthDialog({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "signup" | "signin";
}) {
  const oasisOrigin = process.env.NEXT_PUBLIC_OASIS_ORIGIN!;
  const src = useMemo(() => `${oasisOrigin}${mode === "signup" ? "/signup" : "/login"}`, [mode, oasisOrigin]);

  useEffect(() => {
    async function onMsg(e: MessageEvent) {
      if (e.origin !== oasisOrigin) return;
      if (e.data?.event === "OASIS_SIGNUP_SUCCESS") {
        onOpenChange(false);
        toast.success("Signup successful");
      }
      if (e.data?.event === "OASIS_USER_EXISTS") {
        onOpenChange(false);
        toast("Account exists", { description: "Try signing in." });
      }
      if (e.data?.event === "OASIS_LOGIN_SUCCESS" && e.data?.data?.token) {
        await fetch("/api/session/consume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: e.data.data.token }),
        });
        onOpenChange(false);
        toast.success("Welcome back");
        window.location.assign("/feed");
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [oasisOrigin, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[520px]">
        <VisuallyHidden><DialogTitle>Authentication</DialogTitle></VisuallyHidden>
        <div className="bg-neutral-950">
          <iframe
            title={mode === "signup" ? "TeamWisp Sign up" : "TeamWisp Sign in"}
            src={src}
            className="w-[min(92vw,520px)] h-[640px] block border-0"
            sandbox="allow-scripts allow-forms allow-same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
