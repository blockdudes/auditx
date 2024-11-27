"use client";
import { useState } from "react";
import Image from "next/image";
import PlusIcon from "@/assets/icons/plus.svg";
import MinusIcon from "@/assets/icons/minus.svg";
import { motion, AnimatePresence } from "framer-motion";

const items = [
  {
    question: "How does the auditing process work?",
    answer:
      "Our platform connects projects with verified auditors. Submit your smart contract, and our DAO-vetted auditors will review your code for vulnerabilities and potential improvements. The entire process is transparent and managed through our platform.",
  },
  {
    question: "How are auditors verified?",
    answer:
      "Auditors undergo a thorough verification process managed by our DAO. They must demonstrate their expertise through technical assessments, previous audit experience, and maintain a high-quality track record on our platform.",
  },
  {
    question: "What chains are currently supported?",
    answer:
      "We currently support audits for smart contracts on Aptos, Sui, and Solana. Our auditors are experts in Move and Rust programming languages. We're actively working on expanding to support more chains in the future.",
  },
  {
    question: "How are rewards distributed?",
    answer:
      "Rewards are managed by our DAO governance system. Auditors earn based on the complexity of audits, their reputation score, and the quality of their work. The reward distribution is transparent and automated through smart contracts.",
  },
  {
    question: "How long does an audit typically take?",
    answer:
      "Audit duration varies based on contract complexity and scope. Simple audits may take a few days, while complex protocols might require several weeks. You'll receive a detailed timeline estimate when submitting your project.",
  },
  {
    question: "What happens after vulnerabilities are found?",
    answer:
      "Auditors provide detailed reports of findings with severity levels and recommended fixes. Projects get time to implement fixes, and auditors verify the changes. Final reports are published only after both parties agree.",
  }
];

const AccordinationItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="py-7 border-b border-white/30 cursor-pointer hover:bg-white/5 transition-colors px-4 rounded-lg"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center">
        <span className="flex-1 text-lg font-bold">{question}</span>
        {isOpen ? (
          <Image src={MinusIcon} alt="Collapse" />
        ) : (
          <Image src={PlusIcon} alt="Expand" />
        )}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: "16px" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-gray-300"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQs = () => {
  return (
    <div className="bg-black text-white py-[72px] sm:py-24 bg-gradient-to-b from-[#5D2CA8] to-black">
      <div className="container">
        <h2 className="text-5xl sm:text-6xl sm:w-[648px] mx-auto text-center tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <div className="mt-12 max-w-[748px] mx-auto">
          {items.map(({ question, answer }) => (
            <AccordinationItem
              question={question}
              answer={answer}
              key={question}
            />
          ))}
        </div>
      </div>
    </div>
  );
};