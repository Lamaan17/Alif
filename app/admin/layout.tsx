import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  isAdmin,
  getAdminOverviewCounts,
} from "@/lib/data/admin";

export const metadata = { title: "Admin — Build Together" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const admin = await isAdmin(user.id);
  if (!admin) {
    return (
      <main className="min-h-screen bg-paper-warm/40">
        <AppHeader email={user.email} />
        <div className="container-prose flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper-warm text-ink-muted ring-1 ring-inset ring-paper-line">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className="mt-6 font-display text-2xl tracking-tight">
              Admin access required
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              This area is for ALIF organizers. If you should have access, ask
              another admin to flip your <code>is_admin</code> flag in the
              database.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const counts = await getAdminOverviewCounts();
  const navCounts: Record<string, number> = {
    "/admin/applications": counts.apps_pending,
    "/admin/intros": counts.intros_pending,
  };

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />
      <div className="container-prose py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
          <aside>
            <AdminNav counts={navCounts} />
          </aside>
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </main>
  );
}
