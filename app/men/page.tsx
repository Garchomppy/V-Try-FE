import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

const menProducts = [
  {
    id: "m1",
    name: "Classic White Tee",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
    colors: ["#ffffff", "#000000", "#d1d5db"],
  },
  {
    id: "m2",
    name: "Essential Black Hoodie",
    price: 85,
    image: "/images/pic3.jpg",
    colors: ["#000000", "#4b5563"],
  },
  {
    id: "m3",
    name: "Minimalist Sweatshirt",
    price: 75,
    discountPercentage: 20,
    image: "/images/pic7.jpg",
    colors: ["#e5e7eb", "#9ca3af"],
  },
  {
    id: "m4",
    name: "Denim Jacket",
    price: 120,
    image: "/images/pic9.jpg",
    colors: ["#3b82f6"],
  },
  {
    id: "m5",
    name: "Cotton Cargo Pants",
    price: 95,
    image: "/images/pic12.jpg",
    colors: ["#4b5563", "#064e3b"],
  },
  {
    id: "m6",
    name: "Oversized Graphic Tee",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000"],
  },
  {
    id: "m7",
    name: "Vintage Wash Jeans",
    price: 110,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
    colors: ["#60a5fa", "#3b82f6"],
  },
  {
    id: "m8",
    name: "Heavyweight Zip Hoodie",
    price: 95,
    discountPercentage: 15,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
    colors: ["#1f2937"],
  },
  {
    id: "m9",
    name: "Nylon Track Pants",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000", "#1e3a8a"],
  },
  {
    id: "m10",
    name: "Classic Beanie",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop",
    colors: ["#000000", "#ef4444", "#f59e0b"],
  },
];

export default function MenPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-4">
          Men's Collection
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover our latest arrivals and iconic classics designed for everyday
          comfort and modern style.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {menProducts.map((product) => (
          <div key={product.id} className="group flex flex-col relative">
            <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
              <Link href={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <button
                aria-label="Add to wishlist"
                className="absolute top-3 right-3 p-1.5 hover:bg-white rounded-full transition-colors z-10"
              >
                <Heart
                  className="w-4 h-4 text-gray-600 hover:text-black"
                  strokeWidth={1.5}
                />
              </button>

              {product.discountPercentage && (
                <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 z-10">
                  -{product.discountPercentage}%
                </div>
              )}

              <button
                aria-label="Add to cart"
                className="absolute bottom-3 right-3 p-2 bg-white shadow-md rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ShoppingBag className="w-4 h-4 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex space-x-1.5 mb-2">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Link href={`/product/${product.id}`}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-900 mb-1">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">
                  $
                  {product.discountPercentage
                    ? (
                        product.price *
                        (1 - product.discountPercentage / 100)
                      ).toFixed(2)
                    : product.price.toFixed(2)}
                </span>
                {product.discountPercentage && (
                  <span className="text-xs text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
