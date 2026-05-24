import { User, MessageCircle } from 'lucide-react';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
      <button 
        aria-label="Profile Account"
        className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-colors"
      >
        <User className="w-6 h-6 text-black" strokeWidth={1.5} />
      </button>
      <button 
        aria-label="Support Chat"
        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <MessageCircle className="w-6 h-6 text-black" strokeWidth={1.5} />
      </button>
    </div>
  );
}
