"use client";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CommentList({ postId }: { postId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => { setItems([]); setCursor(null); load(); }, [postId]);

  async function load(next?: string | null) {
    const url = new URL(`/api/posts/${postId}/comments`, window.location.origin);
    if (next) url.searchParams.set("cursor", next);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems((prev) => [...prev, ...data.data]);
    setCursor(data.nextCursor);
  }

  function submit() {
    start(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        if (!res.ok) throw new Error();
        setBody("");
        setItems([]); setCursor(null);
        load();
      } catch {
        toast.error("Unable to comment");
      }
    });
  }

  return (
    <div className="not-prose">
      <div className="space-y-4">
        {items.map((c) => (
          <div key={c._id} className="border border-neutral-200 rounded-xl p-4">
            <div className="text-sm text-neutral-500">anon</div>
            <div className="mt-1 whitespace-pre-wrap">{c.body}</div>
          </div>
        ))}
      </div>
      {cursor && (
        <div className="mt-4">
          <Button variant="outline" onClick={() => load(cursor)}>Load more</Button>
        </div>
      )}
      <div className="mt-8 grid gap-2">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a comment…" />
        <div className="flex justify-end">
          <Button onClick={submit} disabled={pending || !body.trim()}>Comment</Button>
        </div>
      </div>
    </div>
  );
}
