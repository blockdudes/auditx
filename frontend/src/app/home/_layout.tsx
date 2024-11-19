'use client'

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation"; // Import usePathname from Next.js

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current pathname

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container flex items-center justify-between h-16 gap-4">
          <Link href="#" className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 bg-blue-600 rounded-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <span className="text-xl font-semibold">Auditingx</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/home/Repositories" pathname={pathname}>Repositories</NavLink>
            <NavLink href="/home/Auditors" pathname={pathname}>Auditors</NavLink>
            <NavLink href="/home/SubmitRepo" pathname={pathname}>Submit Repo</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <motion.div
              className="w-8 h-8 rounded-full bg-muted"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <Button className="md:hidden" variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? "✕" : "☰"}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.nav
          className="md:hidden fixed inset-0 bg-background z-40 flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NavLink href="/home/Repositories" pathname={pathname}>Repositories</NavLink>
          <NavLink href="/home/Auditors" pathname={pathname}>Auditors</NavLink>
          <NavLink href="/home/SubmitRepo" pathname={pathname}>Submit Repo</NavLink>
        </motion.nav>
      )}

      <main className="container py-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
  pathname,
}: {
  href: string;
  children: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href; // Check if the current pathname matches the link's href

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
