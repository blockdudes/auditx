'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Star, Award, ChevronRight } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import UserProfileModal from "@/components/body/UserProfileModal"

// Add interface for user data
interface User {
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

export default function AuditorsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/allusers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users)
          setFilteredUsers(data.users)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching users:', err)
        setLoading(false)
      })
  }, [])

  // Search function
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter(user => {
      // Search by name
      const nameMatch = (user.githubProfile.name || user.username)
        .toLowerCase()
        .includes(query)

      // Search by expertise (languages and topics)
      const expertise = getExpertise(user.repositories)
      const expertiseMatch = expertise.some(skill => 
        skill.toLowerCase().includes(query)
      )

      // Search by bio
      const bioMatch = user.githubProfile.bio?.toLowerCase().includes(query) || false

      return nameMatch || expertiseMatch || bioMatch
    })

    setFilteredUsers(filtered)
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Auditors</h1>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search auditors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
                disabled={loading}
              >
                Find Auditors
              </Button>
            </div>

            {/* Results Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">Loading auditors...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <AuditorCard
                    key={user._id}
                    user={user}
                    expertise={getExpertise(user.repositories)}
                    rating={calculateRating(user.githubProfile)}
                    onViewProfile={() => {
                      setSelectedUser(user)
                      setIsModalOpen(true)
                    }}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery ? (
                      <>
                        No auditors found matching "{searchQuery}".
                        <Button
                          variant="link"
                          className="ml-2 text-blue-600"
                          onClick={() => {
                            setSearchQuery('')
                            setFilteredUsers(users)
                          }}
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No auditors available.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedUser && (
          <UserProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userData={selectedUser}
          />
        )}
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

// Helper functions
function getExpertise(repositories: User['repositories']) {
  // Get unique languages and topics
  const languages = new Set(repositories
    .map(repo => repo.language)
    .filter(Boolean) as string[])
  
  const topics = new Set(repositories
    .flatMap(repo => repo.topics)
    .filter(Boolean))
  
  // Combine and limit to 3 items
  return Array.from(new Set([...languages, ...topics])).slice(0, 3)
}

function calculateRating(profile: User['githubProfile']) {
  // Simple rating calculation based on followers and public repos
  const baseRating = 4.0
  const followersBonus = Math.min(profile.followers * 0.1, 0.7)
  const reposBonus = Math.min(profile.public_repos * 0.05, 0.3)
  
  return Math.min(Number((baseRating + followersBonus + reposBonus).toFixed(1)), 5.0)
}

// Auditor Card Component
interface AuditorCardProps {
  user: User
  expertise: string[]
  rating: number
  onViewProfile: () => void
}

function AuditorCard({ user, expertise, rating, onViewProfile }: AuditorCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-4">
            <Image
              src={user.image}
              alt={user.githubProfile.name || user.username}
              width={60}
              height={60}
              className="rounded-full"
              unoptimized
            />
            <div>
              <CardTitle>{user.githubProfile.name || user.username}</CardTitle>
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
              <span>{user.githubProfile.public_repos} repos</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {user.githubProfile.bio || `${user.username} is a developer with ${user.repositories.length} public repositories.`}
          </p>
          <Button variant="outline" className="w-full" onClick={onViewProfile}>
            View Profile
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
