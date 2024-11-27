'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Book, CheckCircle, DollarSign, ExternalLink, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userData: {
    _id: string
    username: string
    email: string
    image: string
    githubProfile: {
      name: string
      bio: string | null
      public_repos: number
      followers: number
      following: number
      login: string
    }
    repositories: Array<{
      name: string
      description: string | null
      stargazers_count: number
      language: string | null
      topics: string[]
    }>
  }
}

export default function UserProfileModal({ isOpen, onClose, userData }: UserProfileModalProps) {
  const [isClaimingRewards] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <div className="relative">

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={userData.image}
                alt={userData.githubProfile.name || userData.username}
                width={150}
                height={150}
                className="rounded-full shadow-lg"
                unoptimized
              />
            </motion.div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{userData.githubProfile.name || userData.username}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">@{userData.githubProfile.login}</p>
              <p className="mt-2 max-w-2xl">{userData.githubProfile.bio || 'No bio available'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <Link 
                  href={`https://github.com/${userData.githubProfile.login}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Github size={20} />
                  GitHub Profile
                  <ExternalLink size={16} />
                </Link>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Book size={16} />
                  {userData.githubProfile.public_repos} Repositories
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="repositories">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="repositories">Top Repositories</TabsTrigger>
                    <TabsTrigger value="contributions">Contributions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="repositories">
                    <ul className="space-y-4 mt-4">
                      {userData.repositories.slice(0, 5).map((repo, index) => (
                        <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <h3 className="font-semibold text-lg">{repo.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {repo.description || 'No description available'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">⭐ {repo.stargazers_count}</Badge>
                            {repo.language && (
                              <Badge variant="secondary">{repo.language}</Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="contributions">
                    <div className="p-4 text-center text-gray-600">
                      GitHub contributions will be displayed here
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-2xl font-bold">{userData.githubProfile.followers}</p>
                      <p className="text-gray-600 dark:text-gray-400">Followers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userData.githubProfile.following}</p>
                      <p className="text-gray-600 dark:text-gray-400">Following</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}