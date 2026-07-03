import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

export async function getBlogPosts(): Promise<BlogPostRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("blog_posts").select("*").order("date", { ascending: false });
  return data ?? [];
}

export async function getBlogPost(slug: string): Promise<BlogPostRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
  return data;
}

export async function getBlogPostById(id: string): Promise<BlogPostRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  return data;
}

// Admin operations
export async function adminCreatePost(input: Database["public"]["Tables"]["blog_posts"]["Insert"]): Promise<BlogPostRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("blog_posts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdatePost(id: string, input: Database["public"]["Tables"]["blog_posts"]["Update"]): Promise<BlogPostRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("blog_posts").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeletePost(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}
