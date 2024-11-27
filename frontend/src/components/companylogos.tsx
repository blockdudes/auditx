"use client";
import Image from "next/image";
import aptosLogo from "../../public/aptos.png";
import suiLogo from "../../public/sui.png";
import solanaLogo from "../../public/solana.png";
import rustLogo from "../../public/rust.png";

export default function LogoCarousel() {
  const companies = [
    { 
      src: aptosLogo, 
      alt: "Aptos Logo", 
      name: "Aptos" 
    },
    { 
      src: suiLogo, 
      alt: "Sui Logo", 
      name: "Sui" 
    },
    { 
      src: solanaLogo, 
      alt: "Solana Logo", 
      name: "Solana" 
    },
    { 
      src: rustLogo, 
      alt: "Rust Logo", 
      name: "Rust" 
    }
  ];

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
        {companies.map((company, index) => (
          <li key={index} className="flex justify-between items-center gap-4">
            <Image
              className="w-[3.5rem] object-contain"
              src={company.src}
              alt={company.alt}
              width={60}
              height={60}
            />
            <span className="text-3xl font-bold text-white">
              {company.name}
            </span>
          </li>
        ))}
      </ul>
      <ul
        className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
        aria-hidden="true"
      >
        {companies.map((company, index) => (
          <li key={index} className="flex justify-between items-center gap-4">
            <Image
              className="w-[3.5rem] object-contain"
              src={company.src}
              alt={company.alt}
              width={60}
              height={60}
            />
            <span className="text-3xl font-bold text-white">
              {company.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}