import Link from "next/link";
import { PostComposer } from "@/components/post/post-composer";

async function fetchOrgFeed(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/orgs/${slug}/feed`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load org feed");
  return res.json();
}

export default async function OrgFeed({ params }: { params: { slug: string } }) {
  const { data } = await fetchOrgFeed(params.slug);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight capitalize">{params.slug}</h1>
      {/* Optional composer for signed-in members */}
      <PostComposer orgSlug={params.slug} />
      {data.map((p: any) => (
        <article key={p._id} className="border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50">
          <Link href={`/posts/${p._id}`} className="block">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mt-1 line-clamp-3 text-neutral-700">{p.body}</p>
          </Link>
        </article>
      ))}
    </div>
  );
}
