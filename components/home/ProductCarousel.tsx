import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage?: number;
  image: string;
  colors: string[];
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-center">
          {title}
        </h2>
        
        {/* Using a grid of 5 columns on large screens as specified */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col relative">
              {/* Product Image Container */}
              <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
                <Link href={`/product/${product.id}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                
                {/* Wishlist Icon */}
                <button 
                  aria-label="Add to wishlist"
                  className="absolute top-3 right-3 p-1.5 hover:bg-white rounded-full transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-600 hover:text-black" strokeWidth={1.5} />
                </button>

                {/* Discount Tag */}
                {product.discountPercentage && (
                  <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1">
                    -{product.discountPercentage}%
                  </div>
                )}

                {/* Shopping Bag Icon (Bottom Right on hover or mobile) */}
                <button 
                  aria-label="Add to cart"
                  className="absolute bottom-3 right-3 p-2 bg-white shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-0 opacity-100"
                >
                  <ShoppingBag className="w-4 h-4 text-black" strokeWidth={1.5} />
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex space-x-1.5 mb-2">
                {product.colors.map((color, index) => (
                  <div 
                    key={index} 
                    className="w-3 h-3 rounded-full border border-gray-300 cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Product Info */}
              <Link href={`/product/${product.id}`}>
                <h3 className="text-xs font-medium uppercase tracking-wide text-gray-900 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">
                    ${product.discountPercentage 
                      ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2) 
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
    </section>
  );
}
