"use client";
import { useState } from "react";
import Image from "next/image";
import PlusIcon from "@/assets/icons/plus.svg";
import MinusIcon from "@/assets/icons/minus.svg";
import { motion, AnimatePresence } from "framer-motion";
const items = [
  {
    question: "Are multiple wallets supported?",
    answer:
      "We support wallets provided by APTOS, ensuring you can connect and complete transactions conveniently and securely.",
  },
  {
    question: "How do I integrate the extension into my browser?",
    answer:
      "You can download the extension from the Chrome Web Store or our website and follow the simple installation instructions.",
  },
  {
    question: "Is this extension secure?",
    answer:
      "We prioritize user security and use advanced encryption to protect transaction information. However, you should review and confirm all transactions before proceeding.",
  },
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
      className=" py-7 border-b border-white/30"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center ">
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
    <div className="bg-black text-white py-[72px] sm:py-24 bg-gradient-to-b from-[#5D2CA8] to-black ">
      <div className="container">
        <h2 className="text-5xl sm:text-6xl sm:w-[648px] mx-auto text-center text-white tracking-tighter">
          Frequently Asked Questions
        </h2>
        <div className="mt-12 max-w-[648px] mx-auto">
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