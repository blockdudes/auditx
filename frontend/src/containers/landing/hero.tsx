"use client";
import { AnimatedGradientTextDemo } from "@/components/animatedtext";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Connect from "@/components/Connect";
export const Hero = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/home/Repositories");
    }
  }, [session]);

  return (
    <div className="bg-black text-white bg-heroGradient py-[72px] sm:py-24 relative overflow-clip">
      <div className="absolute h-[375px] w-[750px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] llg:h-[800px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] bg-[radial-gradient(closest-side,#000_82%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]"></div>
      <div className="container relative">
        <div className="flex items-center justify-center -mt-10">
          <Link href={"https://x.com/ActionxSocial"} target="_blank">
            <AnimatedGradientTextDemo />
          </Link>
        </div>
        <div className="flex justify-center mt-8 ">
          <div className="inline-flex relative">
            <h1 className="text-7xl sm:text-9xl font-bold tracking-tightner text-left inline-flex">
              ActionX <br /> Platform
            </h1>
          </div>
        </div>
        <div className="flex justify-center">
          <p className="text-xl text-center mt-8 max-w-md">
            Dear builders, <br />
            Don’t ask what APTOS can do for you <br />
            Ask what you can do for APTOS
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <button onClick={() => signIn("github")} className="bg-white text-black py-3 px-5 rounded-lg font-medium">GITHUB SIGN</button>
          {/* <Link
            href={"/home/Repositories"}
            className="bg-white text-black py-3 px-5 rounded-lg font-medium"
          >
            Try It Out
          </Link> */}
          <Connect />
        </div>
      </div>
    </div>
  );
};