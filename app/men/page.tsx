import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import { products } from "../data/products";

const menProducts = products.map((product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  discountPercentage: product.discountPercentage || undefined,
  image: product.images[0], // primary image is the first one
  colors: product.colors.map((c) => c.hex),
}));

export default function MenPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-4">
          {"Men's Collection"}
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
