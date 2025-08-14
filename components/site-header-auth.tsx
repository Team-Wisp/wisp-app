"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/auth-dialog";

export default function AuthControls() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => { setMode("signin"); setOpen(true); }}>Sign in</Button>
        <Button onClick={() => { setMode("signup"); setOpen(true); }}>Sign up</Button>
      </div>
      <AuthDialog open={open} onOpenChange={setOpen} mode={mode} />
    </>
  );
}
