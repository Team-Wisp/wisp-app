import { LandingHero, Features, HowItWorks, Footer } from "@/components/landing-page/landing-sections";

export default function Page() {
  return (
    <main className="bg-background text-foreground">
      <LandingHero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
