import {DemoVideoDialog} from "@/components/demo-video-dialog";

export const Features = () => {
  return (
    <div className="bg-black text-white">
      <div className="py-[72px] sm:py-24">
        <h2 className="text-center font-bold text-5xl sm:text-6xl tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Secure Smart Contracts Together
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-center mt-5 text-xl text-white/70">
            Join our decentralized auditing platform where expert auditors and blockchain 
            projects collaborate to ensure maximum security. Powered by DAO-managed rewards 
            and cutting-edge tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">For Auditors</h3>
              <p className="text-white/70">
                Earn rewards, build reputation, and access a steady stream of audit opportunities
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">For Projects</h3>
              <p className="text-white/70">
                Get your smart contracts audited by verified experts with transparent pricing
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">DAO Governed</h3>
              <p className="text-white/70">
                Community-driven platform with fair reward distribution and quality assurance
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <div className="relative w-[40rem]">
          <DemoVideoDialog
            className="dark:hidden block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/_2uPmdfSVmk"
            thumbnailSrc="https://i.ibb.co/872W1H7/demo-thumbnail.jpg"
            thumbnailAlt="AuditX Platform Demo"
          />
          <DemoVideoDialog
            className="hidden dark:block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/_2uPmdfSVmk"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
            thumbnailAlt="AuditX Platform Demo"
          />
        </div>
      </div>
    </div>
  );
};