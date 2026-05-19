import Link from "next/link";
import { listAllApplications } from "@/lib/data/admin";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin · Applications — Build Together" };

type SP = { type?: string; status?: string };

const TYPES = ["all", "project", "sprint"] as const;
const STATUSES = ["all", "pending", "accepted", "declined", "withdrawn"] as const;

export default async function AdminApplications({
  searchParams,
}: {
  searchParams: SP;
}) {
  const type = (TYPES as readonly string[]).includes(searchParams.type ?? "")
    ? (searchParams.type as (typeof TYPES)[number])
    : "all";
  const status = (STATUSES as readonly string[]).includes(searchParams.status ?? "")
    ? (searchParams.status as (typeof STATUSES)[number])
    : "all";

  const rows = await listAllApplications({
    type: type === "all" ? undefined : (type as "project" | "sprint"),
    status: status === "all" ? undefined : (status as "pending" | "accepted" | "declined" | "withdrawn"),
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          Admin · Applications
        </span>
        <h1 className="mt-3 font-display text-2xl tracking-tight">
          Project + sprint applications.
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Override or assist any decision. Project owners normally handle their
          own; sprint applications are admin-only.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterRow
          label="Type"
          options={TYPES}
          current={type}
          paramName="type"
          otherParams={{ status }}
        />
        <FilterRow
          label="Status"
          options={STATUSES}
          current={status}
          paramName="status"
          otherParams={{ type }}
        />
      </div>

      <ApplicationsTable rows={rows} />
    </div>
  );
}

function FilterRow({
  label,
  options,
  current,
  paramName,
  otherParams,
}: {
  label: string;
  options: readonly string[];
  current: string;
  paramName: string;
  otherParams: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      {options.map((opt) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(otherParams)) {
          if (v && v !== "all") params.set(k, v);
        }
        if (opt !== "all") params.set(paramName, opt);
        const href = `/admin/applications${params.toString() ? `?${params.toString()}` : ""}`;
        const active = current === opt;
        return (
          <Link
            key={opt}
            href={href}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              active
                ? "border-ink bg-ink text-paper"
                : "border-paper-line bg-paper text-ink-soft hover:bg-paper-warm",
            )}
          >
            {opt}
          </Link>
        );
      })}
    </div>
  );
}
