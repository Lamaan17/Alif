import Link from "next/link";
import { listAllIntros } from "@/lib/data/admin";
import { IntroRow } from "@/components/admin/IntroRow";

export const metadata = { title: "Admin · Intros — Build Together" };

export default async function AdminIntros() {
  const rows = await listAllIntros();
  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          Admin · Intros
        </span>
        <h1 className="mt-3 font-display text-2xl tracking-tight">
          Founder Circle intro requests.
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          When someone in the Circle wants a warm intro to another member, it
          lands here. Accept = ALIF facilitates the intro.
        </p>
      </div>

      <p className="text-xs text-ink-muted">
        {rows.length} {rows.length === 1 ? "request" : "requests"}
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
          <p className="text-sm text-ink-muted">
            No intro requests yet. They&rsquo;ll appear here as Circle members
            reach out.
          </p>
          <p className="mt-2 text-[11px] text-ink-muted">
            See <Link href="/circle" className="underline">the Circle</Link>.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <IntroRow key={r.id} row={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
