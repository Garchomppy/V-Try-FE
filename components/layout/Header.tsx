import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight lowercase"
            >
              V Try
            </Link>
          </div>

          {/* Center Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/mid-season"
              className="text-sm font-medium hover:text-gray-600 uppercase"
            >
              Mid Season
            </Link>
            <Link
              href="/men"
              className="text-sm font-medium hover:text-gray-600 uppercase"
            >
              Men
            </Link>
            <Link
              href="/women"
              className="text-sm font-medium hover:text-gray-600 uppercase"
            >
              Women
            </Link>
            <Link
              href="/kids"
              className="text-sm font-medium hover:text-gray-600 uppercase"
            >
              Kids
            </Link>
            <Link
              href="/athletics"
              className="text-sm font-medium hover:text-gray-600 uppercase"
            >
              Athletics
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium hover:text-gray-600 uppercase"
            >
              Explore
            </Link>
          </nav>

          {/* Right Menu */}
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium hidden sm:block">EN</span>
            <button aria-label="Search" className="hover:text-gray-600">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              aria-label="Profile"
              className="hover:text-gray-600 hidden sm:block"
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              aria-label="Wishlist"
              className="hover:text-gray-600 hidden sm:block"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button aria-label="Cart" className="hover:text-gray-600">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
