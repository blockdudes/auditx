'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Star, Award, ChevronRight } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function AuditorsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <main className="container py-8">
        <motion.div className="max-w-2xl mb-8" {...fadeIn}>
          <h1 className="text-4xl font-bold mb-2">Top Smart Contract Auditors</h1>
          <p className="text-muted-foreground text-lg">
            Discover and connect with skilled auditors to secure your smart contracts.
          </p>
        </motion.div>

        <div className="grid gap-8">
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search auditors by name or expertise" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Find Auditors</Button>
            </div>

            {/* Auditor Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <AuditorCard
                avatar="/placeholder.svg?height=100&width=100"
                name="Alice Johnson"
                expertise={["DeFi", "NFT", "DAO"]}
                rating={4.9}
                auditsCompleted={78}
                description="Experienced smart contract auditor specializing in DeFi protocols and NFT marketplaces. Strong background in Solidity and formal verification techniques."
              />
              <AuditorCard
                avatar="/placeholder.svg?height=100&width=100"
                name="Bob Smith"
                expertise={["ERC20", "ERC721", "Gas Optimization"]}
                rating={4.7}
                auditsCompleted={56}
                description="Security researcher with a focus on token standards and gas optimization. Contributed to several high-profile audits in the Ethereum ecosystem."
              />
              <AuditorCard
                avatar="/placeholder.svg?height=100&width=100"
                name="Carol White"
                expertise={["Layer 2", "Cross-chain", "ZK Proofs"]}
                rating={4.8}
                auditsCompleted={42}
                description="Specialized in Layer 2 solutions and cross-chain protocols. Expert in zero-knowledge proofs and scalability solutions for Ethereum."
              />
              <AuditorCard
                avatar="/placeholder.svg?height=100&width=100"
                name="David Brown"
                expertise={["Governance", "Tokenomics", "Upgradeable Contracts"]}
                rating={4.6}
                auditsCompleted={63}
                description="Focused on governance mechanisms and tokenomics. Extensive experience with upgradeable smart contract patterns and best practices."
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

// Navigation Link Component
function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        active ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

// Auditor Card Component
function AuditorCard({
  avatar,
  name,
  expertise,
  rating,
  auditsCompleted,
  description,
}: {
  avatar: string
  name: string
  expertise: string[]
  rating: number
  auditsCompleted: number
  description: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-4">
            <Image
              src={avatar}
              alt={name}
              width={60}
              height={60}
              className="rounded-full"
            />
            <div>
              <CardTitle>{name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {expertise.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-semibold">{rating}</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-blue-600 mr-1" />
              <span>{auditsCompleted} audits</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Button variant="outline" className="w-full">
            View Profile
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
