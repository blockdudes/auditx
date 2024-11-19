'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, XCircle, AlertTriangle, Search, GitPullRequest, ExternalLink } from 'lucide-react'
import Link from "next/link"

// Mock data for demonstration
const mockProposals = [
  {
    id: 1,
    title: "Implement Multi-Signature Wallet",
    description: "Add multi-signature functionality to enhance security for high-value transactions.",
    proposer: "0x1234...5678",
    timestamp: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    status: "active",
    githubPR: "https://github.com/example/repo/pull/123",
  },
  {
    id: 2,
    title: "Upgrade to Solidity 0.8.0",
    description: "Update the smart contract to use the latest Solidity version for improved security and features.",
    proposer: "0xabcd...efgh",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
    status: "ended",
    githubPR: "https://github.com/example/repo/pull/124",
  },
  {
    id: 3,
    title: "Implement EIP-712 for Better UX",
    description: "Integrate EIP-712 for structured data signing to improve user experience during transactions.",
    proposer: "0x9876...5432",
    timestamp: new Date(Date.now() + 172800000).toISOString(), // 48 hours from now
    status: "active",
    githubPR: "https://github.com/example/repo/pull/125",
  },
]

const repoInfo = {
  name: "Example DeFi Protocol",
  description: "A decentralized finance protocol for lending and borrowing crypto assets.",
  stars: 1234,
  forks: 567,
  openIssues: 23,
}

export default function RepoProposalsPage() {
  const [proposals, setProposals] = useState(mockProposals)
  const [votedProposals, setVotedProposals] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOption, setSortOption] = useState("newest")

  useEffect(() => {
    // In a real application, you would fetch the proposals from an API here
  }, [])

  const handleVote = (proposalId: number) => {
    if (!votedProposals.includes(proposalId)) {
      setVotedProposals([...votedProposals, proposalId])
      // In a real application, you would send the vote to an API here
    }
  }

  const isVotingEnded = (timestamp: string) => {
    return new Date(timestamp) < new Date()
  }

  const filteredAndSortedProposals = proposals
    .filter(proposal => 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || proposal.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-black shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/home/Repositories" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Repositories
          </Link>
          <h1 className="text-3xl font-bold mt-2">{repoInfo.name} Proposals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{repoInfo.description}</p>
          <div className="flex items-center space-x-4 mt-4">
            <Badge variant="secondary">⭐ {repoInfo.stars} stars</Badge>
            <Badge variant="secondary">🍴 {repoInfo.forks} forks</Badge>
            <Badge variant="secondary">🐛 {repoInfo.openIssues} open issues</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search proposals..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-4 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Proposals</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {filteredAndSortedProposals.map((proposal) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gray-100 dark:bg-gray-800">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">{proposal.title}</span>
                    <ProposalStatus status={proposal.status} timestamp={proposal.timestamp} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{proposal.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Proposer</Badge>
                      <span className="text-sm">{proposal.proposer}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link href={proposal.githubPR} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                        <GitPullRequest className="w-4 h-4 mr-1" />
                        View PR
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>
                      {!isVotingEnded(proposal.timestamp) && (
                        <Button
                          onClick={() => handleVote(proposal.id)}
                          disabled={votedProposals.includes(proposal.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {votedProposals.includes(proposal.id) ? 'Voted' : 'Vote'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

function ProposalStatus({ status, timestamp }: { status: string; timestamp: string }) {
  const isEnded = new Date(timestamp) < new Date()

  if (status === 'ended' || isEnded) {
    return (
      <Badge className="bg-gray-500 text-white">
        <Clock className="w-4 h-4 mr-1" />
        Ended
      </Badge>
    )
  }

  const timeLeft = new Date(timestamp).getTime() - Date.now()
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))

  return (
    <Badge className="bg-green-500 text-white">
      <Clock className="w-4 h-4 mr-1" />
      {hoursLeft}h left
    </Badge>
  )
}