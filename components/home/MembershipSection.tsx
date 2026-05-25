import Link from "next/link";

export default function MembershipSection() {
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden my-8">
      {/* Background Drone Shot - Orange Mountain Sunset */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1542272201-b1ca555f8505?q=80&w=2000&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-blac-k/30"></div>{" "}
        {/* Overlay for text contrast */}
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
        <h2 className="text-sm md:text-base font-semibold tracking-[0.2em] mb-4 uppercase">
          Adventure Pass
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold tracking-widest mb-8 uppercase max-w-3xl leading-tight">
          THE V Try CLUB
        </h3>
        <p className="max-w-xl text-sm md:text-base text-gray-200 mb-10">
          Join our exclusive community of adventurers. Earn points, get early
          access to new drops, and discover unique experiences around the world.
        </p>

        <Link
          href="#"
          className="pill-button bg-white text-black hover:bg-gray-100 transition-colors shadow-lg"
        >
          DISCOVER THE BENEFITS
        </Link>
      </div>
    </section>
  );
}
