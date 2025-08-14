async function getMe() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Not signed in");
  return res.json();
}

export default async function MePage() {
  const me = await getMe();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
      <div className="border border-neutral-200 rounded-xl p-5">
        <div><span className="text-neutral-500">Handle:</span> <span className="font-medium">{me.handle}</span></div>
        <div className="mt-2"><span className="text-neutral-500">Org:</span> <span className="font-medium">{me.orgName ?? me.orgSlug}</span></div>
        <div className="mt-2"><span className="text-neutral-500">Role:</span> <span className="font-medium">{me.role ?? "member"}</span></div>
      </div>
    </div>
  );
}
