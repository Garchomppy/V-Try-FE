import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import LookbookBanner from "@/components/home/LookbookBanner";
import ProductCarousel from "@/components/home/ProductCarousel";
import MembershipSection from "@/components/home/MembershipSection";
import NewsletterSection from "@/components/home/NewsletterSection";

// Mock data for products
const classicProducts = [
  {
    id: "p1",
    name: "Classic White Tee",
    price: 35,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
    colors: ["#ffffff", "#000000", "#d1d5db"]
  },
  {
    id: "p2",
    name: "Essential Black Hoodie",
    price: 85,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000", "#4b5563"]
  },
  {
    id: "p3",
    name: "Minimalist Sweatshirt",
    price: 75,
    discountPercentage: 20,
    image: "https://images.unsplash.com/photo-1572495641004-28421ae52e52?q=80&w=600&auto=format&fit=crop",
    colors: ["#e5e7eb", "#9ca3af"]
  },
  {
    id: "p4",
    name: "Denim Jacket",
    price: 120,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
    colors: ["#3b82f6"]
  },
  {
    id: "p5",
    name: "Cotton Cargo Pants",
    price: 95,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
    colors: ["#4b5563", "#064e3b"]
  }
];

const bestSellers = [
  {
    id: "p6",
    name: "Oversized Graphic Tee",
    price: 45,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000"]
  },
  {
    id: "p7",
    name: "Vintage Wash Jeans",
    price: 110,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
    colors: ["#60a5fa", "#3b82f6"]
  },
  {
    id: "p8",
    name: "Heavyweight Zip Hoodie",
    price: 95,
    discountPercentage: 15,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
    colors: ["#1f2937"]
  },
  {
    id: "p9",
    name: "Nylon Track Pants",
    price: 80,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000", "#1e3a8a"]
  },
  {
    id: "p10",
    name: "Classic Beanie",
    price: 25,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000", "#ef4444", "#f59e0b"]
  }
];

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
