"use client";
import Image from "next/image";
import acmeLogo from "@/assets/images/aptos-apt-logo.png";

export default function LogoCarousel() {
  const logos = [
    { src: acmeLogo, alt: "Acme Logo" },
    { src: acmeLogo, alt: "Quantum Logo" },
    { src: acmeLogo, alt: "Echo Logo" },
    { src: acmeLogo, alt: "Celestial Logo" },
    { src: acmeLogo, alt: "Pulse Logo" },
    { src: acmeLogo, alt: "Apex Logo" },
  ];

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
        {logos.map((logo, index) => (
          <li key={index} className="flex justify-between items-center gap-4">
            <Image
              className="w-[3.5rem]"
              src={logo.src}
              alt={logo.alt}
              width={60}
              height={60}
            />
            <span className="text-3xl font-bold">Petra</span>
          </li>
        ))}
      </ul>
      <ul
        className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll "
        aria-hidden="true"
      >
        {logos.map((logo, index) => (
          <li key={index} className="flex justify-between items-center gap-4">
            <Image
              className="w-[3.5rem]"
              src={logo.src}
              alt={logo.alt}
              width={60}
              height={60}
            />
            <span className="text-3xl font-bold">Petra</span>
          </li>
        ))}
      </ul>
    </div>
  );
}