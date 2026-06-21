import Link from "next/link";
import { getActivePromotionsWithProducts } from "@/lib/db/promotions";
import { Sparkles, Calendar, Tag, ArrowRight } from "lucide-react";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Không giới hạn";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CustomerPromotionsPage() {
  const promotions = await getActivePromotionsWithProducts();

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Banner Khuyến Mãi */}
      <div className="relative bg-black text-white overflow-hidden py-16 sm:py-24">
        {/* <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-neutral-900 opacity-90 z-0" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full filter blur-[120px] pointer-events-none" /> */}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Special Offers
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
            PROMOTIONS
          </h1>
          <p className="text-base sm:text-lg text-slate-300">
            Discover the biggest fashion deals of the season at V-TRY. Elevate your style with smart virtual wardrobe and attractive prices.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 max-w-6xl space-y-16">
        {promotions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center shadow-sm">
            <Tag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-800">No promotions yet</h2>
            <p className="text-slate-500 mt-2">Please check back later for the latest promotions.</p>
            <Link href="/" className="inline-block mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold tracking-wide hover:bg-slate-800 transition-all">
              Back to shopping
            </Link>
          </div>
        ) : (
          promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden flex flex-col gap-6 p-6 sm:p-8 hover:shadow-md transition-all duration-300"
            >
              {/* Promotion Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white font-extrabold px-3 py-1 text-sm rounded-lg shadow-sm">
                      {promo.discountPercentage}% OFF
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{promo.name}</h2>
                  </div>
                  {promo.description && (
                    <p className="text-sm text-slate-500 max-w-xl">{promo.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl shrink-0">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>
                    End Date: {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                  </span>
                </div>
              </div>

              {/* Associated Products Grid */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">
                  Products Applied ({promo.products.length})
                </h3>

                {promo.products.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">There are no products applied for this program.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {promo.products.map((product) => {
                      const finalPrice = product.price * (1 - promo.discountPercentage / 100);
                      return (
                        <div
                          key={product.id}
                          className="group border border-slate-100 rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded">
                              -{promo.discountPercentage}%
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  ${finalPrice.toFixed(2)}
                                </span>
                                <span className="text-slate-400 line-through text-xs">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/product/${product.id}`}
                              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white font-bold tracking-wider text-xs rounded-xl uppercase hover:bg-indigo-600 transition-all"
                            >
                              View Details
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
