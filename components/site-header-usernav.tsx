"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function UserNav() {
  const [me, setMe] = useState<{ handle?: string; orgSlug?: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return (
    <nav className="flex items-center gap-4">
      <Link href="/feed" className="text-sm text-neutral-600 hover:text-neutral-900">Home</Link>
      <Link href="/companies" className="text-sm text-neutral-600 hover:text-neutral-900">Companies</Link>
      <Link href="/reviews" className="text-sm text-neutral-600 hover:text-neutral-900">Reviews</Link>
      <Link href="/salaries" className="text-sm text-neutral-600 hover:text-neutral-900">Salaries</Link>
      <Link href="/notifications" className="text-sm text-neutral-600 hover:text-neutral-900">Notifications</Link>
      <Link href="/profile" className="text-sm font-medium text-neutral-900">
        {me?.handle ?? "Profile"}
      </Link>
    </nav>
  );
}
