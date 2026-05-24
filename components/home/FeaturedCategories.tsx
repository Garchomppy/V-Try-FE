import Link from 'next/link';

const categories = [
  { id: 1, name: 'T-SHIRTS', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'HOODIES', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'SWEATSHIRTS', image: 'https://images.unsplash.com/photo-1572495641004-28421ae52e52?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'JACKETS', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 md:mb-0">
            Featured Categories
          </h2>
          <div className="flex space-x-4">
            <Link 
              href="#" 
              className="square-button bg-black text-white text-sm hover:bg-gray-800"
            >
              See Men's
            </Link>
            <Link 
              href="#" 
              className="square-button bg-gray-200 text-black text-sm hover:bg-gray-300"
            >
              See Women's
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link href="#" key={category.id} className="group relative block aspect-[3/4] overflow-hidden bg-gray-100">
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold tracking-widest uppercase">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
