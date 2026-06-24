import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import LookbookBanner from "@/components/home/LookbookBanner";
import ProductCarousel from "@/components/home/ProductCarousel";
import MembershipSection from "@/components/home/MembershipSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getAllProducts } from "@/lib/db/products";

// Component con chịu trách nhiệm fetch dữ liệu
async function ProductSections() {
  const products = await getAllProducts();

  const toCard = (product: (typeof products)[number]) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    discountPercentage: product.discountPercentage || undefined,
    image: product.images[0],
    colors: product.colors.map((c) => c.hex),
  });

  const classicProducts = products.map(toCard);
  const bestSellers = products.map(toCard);

  return (
    <>
      <ProductCarousel title="Classic & Iconic" products={classicProducts} />

      <LookbookBanner
        imageUrl="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2000&auto=format&fit=crop"
        title="Urban Athletics"
      />

      <ProductCarousel
        title="Blue Banana Best Sellers"
        products={bestSellers}
      />
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
        <HeroSection />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
        <FeaturedCategories />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
        <LookbookBanner
          imageUrl="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=2000&auto=format&fit=crop"
          title="Explore The Coast"
        />
      </div>

      {/* Bọc Suspense để trang hiện ra ngay, phần sản phẩm load sau */}
      <Suspense
        fallback={
          <div className="w-full py-32 flex flex-col justify-center items-center gap-4 animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            <p className="text-sm text-slate-400 uppercase tracking-widest font-medium animate-pulse">
              Loading Collections...
            </p>
          </div>
        }
      >
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <ProductSections />
        </div>
      </Suspense>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-both">
        <MembershipSection />
      </div>

      <div className="animate-in fade-in duration-1000 delay-1000 fill-mode-both">
        <NewsletterSection />
      </div>
    </div>
  );
}
