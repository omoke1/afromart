import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  rate_to_base: number;
  auto_update?: boolean;
};

export async function GET() {
  const supabase = await createServerSupabase();

  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny.from("currencies").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body: Currency = await req.json();
  const payload: any = body;

  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny.from("currencies").insert([payload]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const supabase = await createServerSupabase();
  const body: Currency = await req.json();
  if (!body.code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const updatePayload: any = {
    name: body.name,
    symbol: body.symbol,
    rate_to_base: body.rate_to_base,
    auto_update: body.auto_update ?? false,
    updated_at: new Date().toISOString(),
  };

  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny.from("currencies").update(updatePayload).eq("code", body.code);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const supabase = await createServerSupabase();
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const supabaseAny = supabase as any;

  const { error } = await supabaseAny.from("currencies").delete().eq("code", code as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
