import Link from "next/link";

async function fetchFeed() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/feed`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load feed");
  return res.json();
}

export default async function FeedPage() {
  const { data } = await fetchFeed();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Global feed</h1>
      {data.map((p: any) => (
        <article key={p._id} className="border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50">
          <div className="text-sm text-neutral-600 flex flex-wrap items-center gap-2">
            <span className="font-medium">{p.authorHandleSnapshot}</span>
            <span>·</span>
            {p.org ? <Link href={`/orgs/${p.org.slug}`} className="hover:underline">{p.org.name}</Link> : <span>Unknown org</span>}
            <span>·</span>
            <span className="uppercase tracking-wide text-neutral-500">{p.category}</span>
          </div>

          <Link href={`/posts/${p._id}`} className="block mt-2">
            <h2 className="text-lg font-semibold tracking-tight">{p.title}</h2>
            <p className="mt-1 line-clamp-3 text-neutral-700">{p.body}</p>
            <div className="mt-3 text-sm text-neutral-500 flex gap-4">
              <span>❤ {p.likeCount}</span>
              <span>💬 {p.commentCount}</span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
