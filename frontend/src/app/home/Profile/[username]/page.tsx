'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Book, CheckCircle, DollarSign, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Mock data for demonstration
const userData = {
  name: "Alice Johnson",
  username: "alice_blockchain",
  avatarUrl: "/placeholder.svg?height=200&width=200",
  githubUrl: "https://github.com/alice_blockchain",
  bio: "Blockchain developer and smart contract auditor. Passionate about building secure and efficient decentralized systems.",
  repoCount: 47,
  auditCount: 23,
  balanceToClaim: 5000,
  followers: 1200,
  following: 500,
  topRepositories: [
    { name: "defi-protocol", stars: 342, description: "A decentralized finance protocol for lending and borrowing" },
    { name: "nft-marketplace", stars: 256, description: "An NFT marketplace built on Ethereum" },
    { name: "smart-contract-audits", stars: 189, description: "A collection of smart contract audit reports and best practices" },
  ],
  recentAudits: [
    { name: "TokenSwap Protocol", date: "2023-05-15", status: "Completed" },
    { name: "DecentralizedVoting", date: "2023-04-22", status: "In Progress" },
    { name: "NFT Royalty Standard", date: "2023-03-10", status: "Completed" },
  ]
}

export default function GitHubUserProfile() {
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)

  const handleClaimRewards = () => {
    setIsClaimingRewards(true)
    // Simulate API call
    setTimeout(() => {
      setIsClaimingRewards(false)
      // Here you would update the user's balance
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-black shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/home/Auditors" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Auditors
          </Link>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={userData.avatarUrl}
                alt={userData.name}
                width={200}
                height={200}
                className="rounded-full shadow-lg"
              />
            </motion.div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{userData.name}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">@{userData.username}</p>
              <p className="mt-2 max-w-2xl">{userData.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <Link href={userData.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                  <Github size={20} />
                  GitHub Profile
                  <ExternalLink size={16} />
                </Link>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Book size={16} />
                  {userData.repoCount} Repositories
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  {userData.auditCount} Audits
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="repositories">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="repositories">Top Repositories</TabsTrigger>
                  <TabsTrigger value="audits">Recent Audits</TabsTrigger>
                </TabsList>
                <TabsContent value="repositories">
                  <ul className="space-y-4 mt-4">
                    {userData.topRepositories.map((repo, index) => (
                      <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <h3 className="font-semibold text-lg">{repo.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{repo.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">⭐ {repo.stars}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="audits">
                  <ul className="space-y-4 mt-4">
                    {userData.recentAudits.map((audit, index) => (
                      <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <h3 className="font-semibold text-lg">{audit.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Date: {audit.date}</p>
                        <Badge 
                          variant={audit.status === "Completed" ? "default" : "secondary"}
                          className="mt-2"
                        >
                          {audit.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userData.balanceToClaim} USDC</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Available to claim</p>
                <Button 
                  onClick={handleClaimRewards} 
                  disabled={isClaimingRewards}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isClaimingRewards ? 'Claiming...' : 'Claim Rewards'}
                  <DollarSign className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <p className="text-2xl font-bold">{userData.followers}</p>
                    <p className="text-gray-600 dark:text-gray-400">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userData.following}</p>
                    <p className="text-gray-600 dark:text-gray-400">Following</p>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </main>
    </div>
  )
}