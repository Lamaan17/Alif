import { listAllProfiles } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { UserRow } from "@/components/admin/UserRow";
import { UserSearch } from "./UserSearch";

export const metadata = { title: "Admin · Users — Build Together" };

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const search = searchParams.q || "";
  const rows = await listAllProfiles({ search });

  const supabase = createClient();
  // Resolve avatar URLs (storage)
  const avatars = new Map<string, string | null>();
  for (const r of rows) {
    avatars.set(
      r.id,
      r.avatar_url
        ? supabase.storage.from("avatars").getPublicUrl(r.avatar_url).data
            .publicUrl
        : null,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Admin · Users
          </span>
          <h1 className="mt-3 font-display text-2xl tracking-tight">
            Manage builders.
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Click a row to edit level, verified, admin flag, and badges. Edits
            save instantly.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <UserSearch initial={search} />
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Showing {rows.length} {rows.length === 1 ? "user" : "users"}
        {search && (
          <>
            {" "}
            matching “<span className="font-medium text-ink">{search}</span>”
          </>
        )}
      </p>

      <ul className="space-y-2">
        {rows.map((r) => (
          <UserRow
            key={r.id}
            row={{
              id: r.id,
              full_name: r.full_name,
              avatar_url: r.avatar_url,
              location: r.location,
              role_type: r.role_type,
              level: r.level,
              verified: r.verified,
              is_admin: r.is_admin,
              badges: r.badges,
              past_projects: r.past_projects,
            }}
            avatarUrl={avatars.get(r.id) ?? null}
          />
        ))}
      </ul>
    </div>
  );
}
