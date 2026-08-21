import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("site_settings").select("show_catalog_nav, show_product_breadcrumbs, show_product_categories").eq("id", "default").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data ?? { show_catalog_nav: false, show_product_breadcrumbs: false, show_product_categories: false } });
}
