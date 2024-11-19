import {DemoVideoDialog} from "@/components/demo-video-dialog";
export const Features = () => {
  return (
    <div className="bg-black text-white  ">
      <div className="py-[72px] sm:py-24">
        <h2 className="text-center font-bold text-5xl sm:text-6xl tracking-tighter">
          Actions for Anything{" "}
        </h2>
        <div className="max-w-xl mx-auto">
          <p className="text-center mt-5 text-xl text-white/70">
            Swap tokens, stake, buy NFTs, participate in governance. From
            anywhere.
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <div className="relative w-[40rem]">
          <DemoVideoDialog
            className="dark:hidden block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/_2uPmdfSVmk"
            thumbnailSrc="https://i.ibb.co/872W1H7/demo-thumbnail.jpg"
            thumbnailAlt="Hero Video"
          />
          <DemoVideoDialog
            className="hidden dark:block"
            animationStyle="top-in-bottom-out"
            videoSrc="hhttps://www.youtube.com/embed/_2uPmdfSVmk"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
            thumbnailAlt="Hero Video"
          />
        </div>
      </div>
    </div>
  );
};