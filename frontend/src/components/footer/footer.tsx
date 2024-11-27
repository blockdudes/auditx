import Link from "next/link";
import React from "react";
import { IconBrandDiscordFilled, IconBrandX } from "@tabler/icons-react";

export default function Footer() {
  return (
    <>
      <div className="text-white bg-black flex flex-col items-center gap-6 py-16 md:px-8 xl:h-20 xl:flex-row xl:justify-between xl:py-0">
        <div className="xl:flex-1">
          <Link href={"/"}>
            <span className="flex items-center relative">
              <p className="text-3xl lg:text-4xl font-bold bg-logoGradientDark bg-clip-text text-transparent">
                AuditX
              </p>
            </span>
          </Link>
        </div>
        <div className=" flex flex-wrap justify-center gap-x-8 gap-y-6 px-5">
          <div className="flex gap-2 items-center">
            <IconBrandX />
            <span>Follow us</span>
          </div>
          <div className="flex gap-2 items-center">
            <IconBrandDiscordFilled />
            <span>Join the conversation</span>
          </div>
        </div>
        <div className="flex flex-nowrap gap-6 xl:flex-1 xl:justify-end">
          <Link href={"/"}>Privacy Policy</Link>
          <Link href={"/"}>Terms of Service</Link>
        </div>
      </div>
    </>
  );
}