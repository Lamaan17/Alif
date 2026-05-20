import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Sprints from "@/components/Sprints";
import RoomAfterRoom from "@/components/landing/RoomAfterRoom";
import TrustLayer from "@/components/TrustLayer";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { TickerBar } from "@/components/TickerBar";
import { LiveSprint } from "@/components/landing/LiveSprint";
import MapPreview from "@/components/landing/MapPreview";
import { getTickerItems } from "@/lib/data/ticker";
import { getNextOrLiveSprint } from "@/lib/data/stream";

export default async function Home() {
  let tickerItems: Awaited<ReturnType<typeof getTickerItems>> = [];
  let liveSprint: Awaited<ReturnType<typeof getNextOrLiveSprint>> = null;
  try {
    [tickerItems, liveSprint] = await Promise.all([
      getTickerItems(),
      getNextOrLiveSprint(),
    ]);
  } catch {
    // tolerate missing env / DB — landing still renders
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <TickerBar items={tickerItems} />
      <Nav />
      <Hero />
      <RoomAfterRoom />
      {liveSprint && <LiveSprint sprint={liveSprint} />}
      <Features />
      <Sprints />
      <MapPreview />
      <TrustLayer />
      <CTA />
      <Footer />
    </main>
  );
}
