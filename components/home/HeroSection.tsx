import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image - Using a placeholder for outdoor model image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542272201-b1ca555f8505?q=80&w=2000&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black/20"></div> {/* Subtle overlay to ensure text readability */}
      </div>

      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-12 uppercase">
          UP TO 30% OFF - MID SEASON SALE
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="#" 
            className="pill-button bg-white text-black hover:bg-gray-100 w-full sm:w-auto text-center"
          >
            MEN
          </Link>
          <Link 
            href="#" 
            className="pill-button bg-white text-black hover:bg-gray-100 w-full sm:w-auto text-center"
          >
            WOMEN
          </Link>
          <Link 
            href="#" 
            className="pill-button bg-white text-black hover:bg-gray-100 w-full sm:w-auto text-center"
          >
            KIDS
          </Link>
        </div>
      </div>
    </section>
  );
}
