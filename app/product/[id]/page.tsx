"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ChevronRight, Star, Ruler } from "lucide-react";
import { useParams } from "next/navigation";

// 5 mock products for detailed view
const mockProducts = [
  {
    id: "m1",
    name: "Classic White Tee",
    price: 35,
    discountPercentage: null,
    description:
      "Crafted from premium heavyweight cotton, our Classic White Tee offers a relaxed silhouette that drapes perfectly. Features dropped shoulders, a ribbed crewneck, and our signature minimalist approach to everyday wear. Pre-shrunk to maintain its shape wash after wash.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#000000" },
      { name: "Heather Grey", hex: "#d1d5db" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    reviews: { rating: 4.8, count: 124 },
  },
  {
    id: "m2",
    name: "Essential Black Hoodie",
    price: 85,
    discountPercentage: null,
    description:
      "The Essential Black Hoodie is your go-to layer for any season. Made with ultra-soft French terry fabric, it provides unmatched comfort and durability. Features a spacious kangaroo pocket and adjustable drawstring hood.",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512438258380-60b777a83d3d?q=80&w=800&auto=format&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Charcoal", hex: "#4b5563" },
    ],
    sizes: ["S", "M", "L", "XL"],
    reviews: { rating: 4.9, count: 89 },
  },
  {
    id: "m3",
    name: "Minimalist Sweatshirt",
    price: 75,
    discountPercentage: 20,
    description:
      "A clean, modern take on the classic sweatshirt. The Minimalist Sweatshirt is crafted from a mid-weight cotton blend, ensuring breathability and warmth. Perfect for a casual day out or lounging at home.",
    images: [
      "https://images.unsplash.com/photo-1572495641004-28421ae52e52?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614251057488-82542031a19f?q=80&w=800&auto=format&fit=crop",
    ],
    colors: [
      { name: "Light Grey", hex: "#e5e7eb" },
      { name: "Slate", hex: "#9ca3af" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    reviews: { rating: 4.7, count: 56 },
  },
  {
    id: "m4",
    name: "Denim Jacket",
    price: 120,
    discountPercentage: null,
    description:
      "A timeless staple piece. Our Denim Jacket features premium rigid denim that molds to your body over time. Finished with classic metal hardware, contrast stitching, and multiple pockets for utility.",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=800&auto=format&fit=crop",
    ],
    colors: [{ name: "Washed Blue", hex: "#3b82f6" }],
    sizes: ["S", "M", "L", "XL"],
    reviews: { rating: 4.5, count: 42 },
  },
  {
    id: "m5",
    name: "Cotton Cargo Pants",
    price: 95,
    discountPercentage: null,
    description:
      "Function meets style in these Cotton Cargo Pants. Designed with a relaxed fit and ample pocket space, they are incredibly versatile. Made from durable cotton twill that can withstand rugged outdoor adventures or city living.",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378441864-6da5e65a7e6b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378440523-28825bd83a8b?q=80&w=800&auto=format&fit=crop",
    ],
    colors: [
      { name: "Charcoal", hex: "#4b5563" },
      { name: "Forest Green", hex: "#064e3b" },
    ],
    sizes: ["28", "30", "32", "34", "36"],
    reviews: { rating: 4.8, count: 110 },
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const product =
    mockProducts.find((p) => p.id === productId) || mockProducts[0]; // fallback to first if not found

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  const finalPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center text-xs text-gray-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link href="/men" className="hover:text-black">
            Men
          </Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-black font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Images - Left Side */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible w-full md:w-24 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-[3/4] w-20 md:w-full shrink-0 overflow-hidden bg-gray-100 ${selectedImage === idx ? "ring-1 ring-black" : "opacity-70 hover:opacity-100"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discountPercentage && (
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5">
                  -{product.discountPercentage}%
                </div>
              )}
            </div>
          </div>

          {/* Product Details - Right Side */}
          <div className="w-full lg:w-2/5 flex flex-col pt-4 lg:pt-8">
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.reviews.rating) ? "fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  ({product.reviews.count} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-2xl font-bold">
                ${finalPrice.toFixed(2)}
              </span>
              {product.discountPercentage && (
                <span className="text-lg text-gray-400 line-through mb-0.5">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Color: {product.colors[selectedColor]?.name}
                </span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-10 h-10 rounded-full border-2 ${selectedColor === idx ? "border-black p-0.5" : "border-transparent"}`}
                  >
                    <div
                      className="w-full h-full rounded-full border border-gray-200"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Size
                </span>
                <button className="text-xs text-gray-500 underline flex items-center gap-1 hover:text-black">
                  <Ruler className="w-3 h-3" /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-medium border ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-black hover:border-black"
                    } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* V-Fit AI Suggestion Demo placeholder */}
              <div className="mt-4 bg-gray-50 border border-gray-200 p-4 flex items-start gap-3">
                <div className="bg-black text-white p-1.5 rounded-full mt-0.5">
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider">
                    V-Fit AI Suggestion
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Based on your profile, size <strong>{selectedSize}</strong>{" "}
                    has a 95% fit match.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <button className="flex-1 bg-black text-white py-4 uppercase font-bold tracking-widest hover:bg-gray-900 transition-colors">
                Add to Cart
              </button>
              <button className="w-14 h-14 flex items-center justify-center border border-gray-300 hover:border-black transition-colors">
                <Heart className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Product Details Accordion Placeholders */}
            <div className="border-t border-gray-200">
              {["Details & Care", "Shipping & Returns"].map((tab) => (
                <div
                  key={tab}
                  className="border-b border-gray-200 py-4 flex justify-between items-center cursor-pointer group"
                >
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {tab}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
