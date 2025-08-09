"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { toast } from "sonner";

type Mode = "signup" | "signin";

export default function LandingHero() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signup");

  const oasisOrigin = process.env.NEXT_PUBLIC_OASIS_ORIGIN!;
  const iframeSrc = useMemo(() => {
    const path = mode === "signup" ? "/signup" : "/login";
    return `${oasisOrigin}${path}`;
  }, [mode, oasisOrigin]);

  // Close dialog on success messages from iframe (and only from trusted origin)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!oasisOrigin || e.origin !== oasisOrigin) return;
      if (e.data?.event === "OASIS_SIGNUP_SUCCESS") {
        setOpen(false);
        toast.success("Signup successful", { description: "Welcome to TeamWisp!" });
      }
      if (e.data?.event === "OASIS_LOGIN_SUCCESS") {
        setOpen(false);
        toast.success("Welcome back!", { description: "You are now logged in." });
      }
      if (e.data?.event === "OASIS_USER_EXISTS") {
        toast.info("Account already exists", { description: "Please sign in instead." });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [oasisOrigin]);

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground">
          TeamWisp
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          A private space for professionals to connect, collaborate, and thrive — built
          with clarity, privacy, and simplicity at its core.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => {
              setMode("signup");
              setOpen(true);
            }}
          >
            Sign up
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setMode("signin");
              setOpen(true);
            }}
          >
            Sign in
          </Button>
        </div>
      </div>

      {/* Auth dialog with iframe */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden sm:max-w-[460px]">
          <VisuallyHidden>
            <DialogTitle>
              {mode === "signup" ? "Create your account" : "Sign in to your account"}
            </DialogTitle>
          </VisuallyHidden>
          <iframe
            title={mode === "signup" ? "TeamWisp Sign up" : "TeamWisp Sign in"}
            src={iframeSrc}
            className="w-full h-[640px] border-0"
            sandbox="allow-scripts allow-forms allow-same-origin"
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
