"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ChevronRight, Star, Ruler, Sparkles, X } from "lucide-react";
import { useParams } from "next/navigation";

import { products } from "../../data/products";
import { availableFeatures } from "../../data/try-on-assets";
import TryOnModal from "@/components/try-on/TryOnModal";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const features = availableFeatures(product.tryOn);
  const hasTryOn = features.ar || features.avatar3d || features.sizeSuggestion;

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
          {/* Product Images — Left */}
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

          {/* Product Details — Right */}
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
                <button 
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-gray-500 underline flex items-center gap-1 hover:text-black"
                >
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
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-12">
              {hasTryOn && (
                <button
                  onClick={() => setTryOnOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-black bg-white text-black py-4 uppercase font-bold tracking-widest text-sm hover:bg-gray-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Try On with AI
                </button>
              )}
              <div className="flex gap-4">
                <button className="flex-1 bg-black text-white py-4 uppercase font-bold tracking-widest hover:bg-gray-900 transition-colors">
                  Add to Cart
                </button>
                <button className="w-14 h-14 flex items-center justify-center border border-gray-300 hover:border-black transition-colors">
                  <Heart className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>
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

      {/* AI Try-On Modal */}
      <TryOnModal
        product={product}
        open={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        selectedSize={selectedSize}
        selectedColor={product.colors[selectedColor]?.hex ?? "#000000"}
      />

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold uppercase tracking-widest">Size Guide</h3>
              <button 
                onClick={() => setSizeGuideOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {product.tryOn?.sizing?.sizeChart && product.tryOn.sizing.sizeChart.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold border-b">Size</th>
                        <th className="px-4 py-3 font-semibold border-b">Ngực (cm)</th>
                        <th className="px-4 py-3 font-semibold border-b">Eo (cm)</th>
                        {product.tryOn.sizing.sizeChart.some(s => s.hipsCm) && (
                          <th className="px-4 py-3 font-semibold border-b">Mông (cm)</th>
                        )}
                        {product.tryOn.sizing.sizeChart.some(s => s.lengthCm) && (
                          <th className="px-4 py-3 font-semibold border-b">Dài (cm)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {product.tryOn.sizing.sizeChart.map((row) => {
                        const formatRange = (range?: [number, number]) => {
                          if (!range || (range[0] === 0 && range[1] === 0)) return "-";
                          return `${range[0]} - ${range[1]}`;
                        };
                        return (
                          <tr key={row.size} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 font-bold border-r bg-gray-50/50">{row.size}</td>
                            <td className="px-4 py-3">{formatRange(row.chestCm)}</td>
                            <td className="px-4 py-3">{formatRange(row.waistCm)}</td>
                            {product.tryOn?.sizing?.sizeChart?.some(s => s.hipsCm) && (
                              <td className="px-4 py-3">{formatRange(row.hipsCm)}</td>
                            )}
                            {product.tryOn?.sizing?.sizeChart?.some(s => s.lengthCm) && (
                              <td className="px-4 py-3">{row.lengthCm || "-"}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Ruler className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Chưa có thông tin bảng size cho sản phẩm này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
