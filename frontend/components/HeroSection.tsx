import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative h-[25vh] w-full flex flex-col items-center justify-center text-center bg-background">
      {/* Optional: Add a very subtle animated background pattern */}
      <div className="absolute inset-0 bg-[url('/hero-dots.svg')] bg-[length:200px_200px] opacity-[0.03] animate-pulse"></div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-5 text-foreground">
          Discover Amazing Products
        </h1>
        <p className="text-base md:text-lg max-w-2xl mb-8 text-muted-foreground">
          Explore our curated collection of high-quality products at unbeatable
          prices
        </p>
    
      </div>

     
    </section>
  );
}
