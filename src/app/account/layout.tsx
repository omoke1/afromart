import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
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
