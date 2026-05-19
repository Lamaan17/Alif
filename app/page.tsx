import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Sprints from "@/components/Sprints";
import BuilderJourney from "@/components/landing/BuilderJourney";
import TrustLayer from "@/components/TrustLayer";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { TickerBar } from "@/components/TickerBar";
import { getTickerItems } from "@/lib/data/ticker";

export default async function Home() {
  let tickerItems: Awaited<ReturnType<typeof getTickerItems>> = [];
  try {
    tickerItems = await getTickerItems();
  } catch {
    // tolerate missing env / DB at landing — landing still renders
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <TickerBar items={tickerItems} />
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Sprints />
      <BuilderJourney />
      <TrustLayer />
      <CTA />
      <Footer />
    </main>
  );
}
