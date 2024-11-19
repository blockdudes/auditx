'use client'

import { ReactNode, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Moon, Sun } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') !== 'false'
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white dark:bg-blue-400 rounded-full opacity-30 dark:opacity-20"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <Link href="#" className="flex items-center gap-2">
              <span className="text-xl font-semibold">Auditingx</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="/home/Repositories" pathname={pathname}>Repositories</NavLink>
              <NavLink href="/home/Auditors" pathname={pathname}>Auditors</NavLink>
              <NavLink href="/home/SubmitRepo" pathname={pathname}>Submit Repo</NavLink>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                <Bell className="w-5 h-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <motion.div
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              <Button className="md:hidden" variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? "✕" : "☰"}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.nav
            className="md:hidden fixed inset-0 bg-white dark:bg-black z-40 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NavLink href="/home/Repositories" pathname={pathname}>Repositories</NavLink>
            <NavLink href="/home/Auditors" pathname={pathname}>Auditors</NavLink>
            <NavLink href="/home/SubmitRepo" pathname={pathname}>Submit Repo</NavLink>
          </motion.nav>
        )}

        <main className="container mx-auto py-8 px-4">{children}</main>
      </div>
    </div>
  )
}

function NavLink({
  href,
  children,
  pathname,
}: {
  href: string
  children: React.ReactNode
  pathname: string
}) {
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
        isActive
          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
          : "text-gray-600 dark:text-gray-300"
      }`}
    >
      {children}
    </Link>
  )
}