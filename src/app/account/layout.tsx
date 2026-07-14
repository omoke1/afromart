import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
