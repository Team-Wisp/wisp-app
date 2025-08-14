async function getReviews(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/companies/${slug}/reviews`, { cache: "no-store" });
  if (!res.ok) return { data: [] };
  return res.json();
}
async function getSalaries(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/companies/${slug}/salaries`, { cache: "no-store" });
  if (!res.ok) return { data: [] };
  return res.json();
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const [reviews, salaries] = await Promise.all([getReviews(params.slug), getSalaries(params.slug)]);
  const reviewList = reviews.data ?? reviews;
  const salaryList = salaries.data ?? salaries;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight capitalize">{params.slug}</h1>

      <section>
        <h2 className="text-lg font-semibold">Recent reviews</h2>
        <div className="mt-4 space-y-4">
          {reviewList.map((r: any) => (
            <div key={r._id} className="border border-neutral-200 rounded-xl p-4">
              <div className="text-sm text-neutral-500">Rating: {r.rating}/5</div>
              <p className="mt-1 whitespace-pre-wrap">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recent salaries</h2>
        <div className="mt-4 space-y-4">
          {salaryList.map((s: any) => (
            <div key={s._id} className="border border-neutral-200 rounded-xl p-4">
              <div className="text-sm text-neutral-500">{s.jobTitle} — {s.location}</div>
              <div className="mt-1 font-medium">
                {typeof s.salary === "number" ? s.salary.toLocaleString() : s.salary}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
