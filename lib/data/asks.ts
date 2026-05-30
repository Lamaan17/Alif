import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AskRow = {
  id: string;
  author_id: string;
  title: string;
  body: string | null;
  kind: string;
  audience: string;
  created_at: string;
  est_minutes: number | null;
  deadline: string | null;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role_type: string | null;
    level: number;
    is_admin: boolean;
  } | null;
  answer_count?: number;
};

const ASK_SELECT = `
  id, author_id, title, body, kind, audience, created_at, est_minutes, deadline,
  author:profiles!asks_author_id_fkey (
    id, full_name, avatar_url, role_type, level, is_admin
  )
`;

function firstAuthor<T>(a: T | T[]): T | null {
  return Array.isArray(a) ? a[0] ?? null : a;
}

export async function listAsks(): Promise<AskRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("asks")
    .select(ASK_SELECT)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as AskRow[];
  const ids = rows.map((r) => r.id);
  const counts = await answerCounts(ids);
  return rows.map((r) => ({
    ...r,
    author: firstAuthor(r.author),
    answer_count: counts.get(r.id) ?? 0,
  }));
}

async function answerCounts(askIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (askIds.length === 0) return map;
  const supabase = createClient();
  const { data } = await supabase
    .from("ask_answers")
    .select("ask_id")
    .in("ask_id", askIds);
  for (const r of data ?? []) {
    const id = (r as { ask_id: string }).ask_id;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

export async function getAsk(id: string): Promise<AskRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("asks")
    .select(ASK_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as unknown as AskRow;
  return { ...row, author: firstAuthor(row.author) };
}

export type AnswerRow = {
  id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role_type: string | null;
    level: number;
    is_admin: boolean;
  } | null;
};

export async function getAnswers(askId: string): Promise<AnswerRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ask_answers")
    .select(
      `
        id, body, created_at,
        author:profiles!ask_answers_author_id_fkey (
          id, full_name, avatar_url, role_type, level, is_admin
        )
      `,
    )
    .eq("ask_id", askId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => {
    const row = r as unknown as AnswerRow;
    return { ...row, author: firstAuthor(row.author) };
  });
}
