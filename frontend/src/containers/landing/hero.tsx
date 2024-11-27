"use client";
import { Loader2 } from "lucide-react";
import { AnimatedGradientTextDemo } from "@/components/animatedtext";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Connect from "@/components/Connect";

export const Hero = () => {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const router = useRouter();
  const wallet = useWallet();
  
  useEffect(() => {
    if (session.status === "authenticated" && wallet.connected) {
      router.push("/home/Repositories");
    }
  }, [session, wallet.connected]);

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github");
    } catch (error) {
      console.error("GitHub sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black text-white bg-heroGradient py-[72px] sm:py-24 relative overflow-clip">
      <div className="absolute h-[375px] w-[750px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] llg:h-[800px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] bg-[radial-gradient(closest-side,#000_82%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]"></div>
      <div className="container relative">
        <div className="flex items-center justify-center -mt-10">
          <Link href={"https://github.com/chirag9899"} target="_blank">
            <AnimatedGradientTextDemo />
          </Link>
        </div>
        <div className="flex justify-center mt-8 ">
          <div className="inline-flex relative">
            <h1 className="text-7xl sm:text-9xl font-bold tracking-tightner text-left inline-flex">
              AuditX <br />
            </h1>
          </div>
        </div>
        <div className="flex justify-center">
          <p className="text-xl text-center mt-8 max-w-md">
          Decentralized Web3 Auditing Platform
          <br />
          <br />
          <br />
          </p>
        </div>
        <div className="flex gap-2 justify-center mt-8">
          <button 
            onClick={handleGithubSignIn} 
            disabled={isLoading || session.status === "authenticated"}
            className="bg-white text-black py-3 px-5 rounded-lg font-medium inline-flex items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : session.status === "authenticated" ? (
              'Connected to GitHub'
            ) : (
              'GITHUB SIGN'
            )}
          </button>
          {wallet.connected ? (
            <button 
              disabled
              className="bg-white text-black py-3 px-5 rounded-lg font-medium inline-flex items-center gap-2 opacity-70"
            >
              Connected to Wallet
            </button>
          ) : (
            <Connect/>
          )}
        </div>
      </div>
    </div>
  );
};