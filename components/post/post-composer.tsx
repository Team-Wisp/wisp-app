"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function PostComposer({ orgSlug }: { orgSlug: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      try {
        const res = await fetch(`/api/orgs/${orgSlug}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "company", title, body }),
        });
        if (!res.ok) throw new Error();
        setTitle(""); setBody("");
        toast.success("Posted");
        window.location.reload();
      } catch {
        toast.error("Could not post");
      }
    });
  }

  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-white">
      <Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <Textarea className="mt-2" rows={5} placeholder="Share with your company…" value={body} onChange={(e)=>setBody(e.target.value)} />
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={pending || !title.trim() || !body.trim()}>Post</Button>
      </div>
    </div>
  );
}
