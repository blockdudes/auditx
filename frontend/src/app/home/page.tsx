'use client'
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <motion.div className="max-w-2xl mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-4xl font-bold mb-2">Welcome to Auditingx</h1>
      <p className="text-muted-foreground text-lg">
        Browse repositories, audit contracts, and earn rewards through decentralized voting.
      </p>
    </motion.div>
  );
}
