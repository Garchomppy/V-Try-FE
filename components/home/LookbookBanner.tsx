interface LookbookBannerProps {
  imageUrl: string;
  title?: string;
  height?: string;
}

export default function LookbookBanner({ imageUrl, title, height = "h-[60vh]" }: LookbookBannerProps) {
  return (
    <section className={`relative w-full ${height} min-h-[400px] overflow-hidden`}>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        {title && <div className="absolute inset-0 bg-black/20"></div>}
      </div>
      
      {title && (
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-3xl md:text-5xl font-bold tracking-widest uppercase text-center px-4">
            {title}
          </h2>
        </div>
      )}
    </section>
  );
}
