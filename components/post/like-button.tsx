"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LikeButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      try {
        const method = liked ? "DELETE" : "POST";
        const res = await fetch(`/api/posts/${postId}/like`, { method });
        if (!res.ok) throw new Error();
        setLiked(!liked);
        setCount((c) => c + (liked ? -1 : 1));
      } catch {
        toast.error("Unable to update like");
      }
    });
  }

  return (
    <Button onClick={toggle} variant={liked ? "default" : "outline"} disabled={pending}>
      ❤ {count}
    </Button>
  );
}
