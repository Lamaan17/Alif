import Link from "next/link";
import { ArrowRight, MapPin, Users, Sparkles } from "lucide-react";

import { getNetworkData } from "@/lib/data/network";
import { CityMap } from "@/components/map/CityMap";

export default async function MapPreview() {
  const { cities, totalBuilders, mostActive } = await getNetworkData();
  const hubsCount = cities.filter((c) => c.isHub).length;

  return (
    <section
      id="map"
      className="relative isolate overflow-hidden border-y border-paper-line bg-paper-deep"
    >
      <div className="container-prose py-20 sm:py-24">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              The ALIF Builder Network
            </span>
            <h2 className="mt-5 h-section">
              Builders, projects, and collaborations{" "}
              <em className="italic font-medium text-ink">across cities</em>.
            </h2>
            <p className="lead mt-4">
              A living network of ambitious builders. Click any city to see
              who&rsquo;s active, what&rsquo;s shipping, and what&rsquo;s next.
            </p>
          </div>
          <Link
            href="/pulse#map"
            className="btn-secondary self-start lg:self-end"
          >
            Open the map
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mini metrics strip */}
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-paper-line bg-paper-line sm:grid-cols-4">
          <Stat icon={MapPin} value={cities.length} label="Active cities" />
          <Stat icon={Sparkles} value={hubsCount} label="Featured hubs" />
          <Stat icon={Users} value={totalBuilders} label="Builders mapped" />
          <Stat
            icon={Sparkles}
            value={mostActive.name}
            label="Most active"
            small
          />
        </div>

        {/* Map */}
        <div className="mt-8">
          <CityMap cities={cities} compact />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  small,
}: {
  icon: typeof MapPin;
  value: string | number;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="bg-paper px-5 py-5">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={
          small
            ? "mt-2 font-display text-xl font-semibold tracking-tight text-ink"
            : "mt-2 font-display text-3xl font-semibold tracking-tight text-ink"
        }
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </div>
    </div>
  );
}
