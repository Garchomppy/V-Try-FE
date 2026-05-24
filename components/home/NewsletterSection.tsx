"use client";

export default function NewsletterSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">
          Newsletter
        </h2>
        <p className="text-gray-600 mb-8 max-w-md text-sm">
          Subscribe to receive updates, access to exclusive deals, and more.
        </p>
        
        <form className="flex w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="flex-grow border border-black border-r-0 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            required
          />
          <button 
            type="submit" 
            className="bg-black text-white px-6 py-3 font-medium uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
