import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/sections/HeroCarousel";
import ShopByCategory from "@/components/sections/ShopByCategory";
import BestSellers from "@/components/sections/BestSellers";

export default function Home() {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <HeroCarousel />
      <ShopByCategory />
      <BestSellers />
      <div className="mt-20" />
      <Footer />
    </main>
  );
}
