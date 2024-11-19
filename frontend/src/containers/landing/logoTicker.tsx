"use client";
import LogoCarousel from "@/components/companylogos";

export const LogoTicker = () => {
  return (
    <div className="bg-black text-white py-[72px] sm:py-24">
      <div className="container">
        <h2 className="text-lg text-center text-white/70 mb-16">
          We work with the best
        </h2>
        <LogoCarousel />
      </div>
    </div>
  );
};