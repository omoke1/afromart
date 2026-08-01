import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ currency: null });
  }

  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny
    .from('profiles')
    .select('currency')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ currency: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ currency: data?.currency ?? null });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const code = body?.code;
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const supabaseAny = supabase as any;
  const { error } = await supabaseAny.from('profiles').update({ currency: code } as any).eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
