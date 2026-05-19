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
import { LiveSprint } from "@/components/landing/LiveSprint";
import { ActivityStream } from "@/components/landing/ActivityStream";
import MapPreview from "@/components/landing/MapPreview";
import PulsePreview from "@/components/landing/PulsePreview";
import { getTickerItems } from "@/lib/data/ticker";
import { getEcosystemStream, getNextOrLiveSprint } from "@/lib/data/stream";

export default async function Home() {
  let tickerItems: Awaited<ReturnType<typeof getTickerItems>> = [];
  let liveSprint: Awaited<ReturnType<typeof getNextOrLiveSprint>> = null;
  let stream: Awaited<ReturnType<typeof getEcosystemStream>> = [];
  try {
    [tickerItems, liveSprint, stream] = await Promise.all([
      getTickerItems(),
      getNextOrLiveSprint(),
      getEcosystemStream(8),
    ]);
  } catch {
    // tolerate missing env / DB — landing still renders
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <TickerBar items={tickerItems} />
      <Nav />
      <Hero />
      {liveSprint && <LiveSprint sprint={liveSprint} />}
      <Features />
      <HowItWorks />
      <Sprints />
      {stream.length > 0 && <ActivityStream items={stream} />}
      <BuilderJourney />
      <MapPreview />
      <TrustLayer />
      <PulsePreview />
      <CTA />
      <Footer />
    </main>
  );
}
