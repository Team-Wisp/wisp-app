export function LandingHero() {
  return (
    <section className="py-16">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
        TeamWisp
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        A private space for professionals to connect, collaborate, and thrive —
        built with clarity, privacy, and simplicity at its core.
      </p>
    </section>
  );
}

export function Features() {
  return (
    <section className="py-12 border-t border-neutral-200">
      <h2 className="text-xl font-semibold tracking-tight">Why TeamWisp</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="border border-neutral-200 rounded-xl p-5 bg-white">
          <h3 className="font-medium">Anonymity by design</h3>
          <p className="mt-2 text-neutral-600">
            Membership-based identities keep you safe while keeping discussions high-signal.
          </p>
        </div>
        <div className="border border-neutral-200 rounded-xl p-5 bg-white">
          <h3 className="font-medium">Company channels</h3>
          <p className="mt-2 text-neutral-600">
            Share insights within your company or browse what others are talking about.
          </p>
        </div>
        <div className="border border-neutral-200 rounded-xl p-5 bg-white">
          <h3 className="font-medium">Comp & reviews</h3>
          <p className="mt-2 text-neutral-600">
            Real compensation and reviews from verified members.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="py-12 border-t border-neutral-200">
      <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
      <ol className="mt-6 space-y-4 text-neutral-700">
        <li><span className="font-medium">1.</span> Verify with your work/college email (via our secure auth window).</li>
        <li><span className="font-medium">2.</span> Post and comment using an anonymous handle scoped to your org.</li>
        <li><span className="font-medium">3.</span> Explore feeds, company boards, reviews, and salaries.</li>
      </ol>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 border-t border-neutral-200 text-sm text-neutral-500">
      <div>© {new Date().getFullYear()} TeamWisp • Privacy • Terms</div>
    </footer>
  );
}
