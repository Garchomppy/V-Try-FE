import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-sm">
          {/* Column 1 */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">Attendance</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="#" className="hover:text-black">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-black">FAQ</Link></li>
              <li><Link href="#" className="hover:text-black">Track Order</Link></li>
              <li><Link href="#" className="hover:text-black">Returns</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">Información</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="#" className="hover:text-black">About Us</Link></li>
              <li><Link href="#" className="hover:text-black">Our Stores</Link></li>
              <li><Link href="#" className="hover:text-black">Sustainability</Link></li>
              <li><Link href="#" className="hover:text-black">Careers</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">Socials</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="#" className="hover:text-black">Instagram</Link></li>
              <li><Link href="#" className="hover:text-black">TikTok</Link></li>
              <li><Link href="#" className="hover:text-black">YouTube</Link></li>
              <li><Link href="#" className="hover:text-black">Facebook</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-bold uppercase mb-4 tracking-wider">Terms and Policy</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="#" className="hover:text-black">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-black">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-black">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-black">Legal Notice</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {/* Fake B Corp Logo */}
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-800">
              B
            </div>
            <span>B Corp Certified</span>
          </div>
          
          <div className="mb-4 md:mb-0">
            &copy; 2026 Blue Banana Brand. All rights reserved.
          </div>
          
          {/* Fake Payment Icons */}
          <div className="flex space-x-3 opacity-60">
            <div className="w-8 h-5 bg-gray-200 rounded"></div>
            <div className="w-8 h-5 bg-gray-200 rounded"></div>
            <div className="w-8 h-5 bg-gray-200 rounded"></div>
            <div className="w-8 h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
