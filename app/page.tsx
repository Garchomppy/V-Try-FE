import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import LookbookBanner from "@/components/home/LookbookBanner";
import ProductCarousel from "@/components/home/ProductCarousel";
import MembershipSection from "@/components/home/MembershipSection";
import NewsletterSection from "@/components/home/NewsletterSection";

import { products } from "./data/products";

const classicProducts = products.map((product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  discountPercentage: product.discountPercentage || undefined,
  image: product.images[0],
  colors: product.colors.map((c) => c.hex),
}));

const bestSellers = products.map((product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  discountPercentage: product.discountPercentage || undefined,
  image: product.images[0],
  colors: product.colors.map((c) => c.hex),
}));

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      
      <FeaturedCategories />

      <LookbookBanner 
        imageUrl="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=2000&auto=format&fit=crop"
        title="Explore The Coast"
      />

      <ProductCarousel 
        title="Classic & Iconic" 
        products={classicProducts} 
      />

      <LookbookBanner 
        imageUrl="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=2000&auto=format&fit=crop"
        title="Urban Athletics"
      />

      <ProductCarousel 
        title="Blue Banana Best Sellers" 
        products={bestSellers} 
      />

      <MembershipSection />
      
      <NewsletterSection />
    </div>
  );
}
