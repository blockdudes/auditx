'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Github } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

export default function SubmitRepoPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container py-8">
        <motion.div className="max-w-2xl mx-auto" {...fadeIn}>
          <h1 className="text-4xl font-bold mb-2">Submit Your Repository for Audit</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Provide details about your smart contract repository to initiate the audit process.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Repository Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="repo-url" className="text-sm font-medium">GitHub Repository URL</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="repo-url" placeholder="https://github.com/yourusername/your-repo" className="pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="project-name" className="text-sm font-medium">Project Name</label>
                  <Input id="project-name" placeholder="Enter your project name" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contract-type" className="text-sm font-medium">Contract Type</label>
                  <Select>
                    <SelectTrigger id="contract-type">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="dao">DAO</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Project Description</label>
                  <Textarea id="description" placeholder="Provide a brief description of your project and the smart contracts to be audited" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="audit-requirements" className="text-sm font-medium">Specific Audit Requirements</label>
                  <Textarea id="audit-requirements" placeholder="Describe any specific areas or concerns you want the auditors to focus on" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="reward" className="text-sm font-medium">Audit Reward (USDC)</label>
                  <Input id="reward" type="number" placeholder="Enter the reward amount in USDC" />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Submit Repository for Audit</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

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