'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, XCircle, AlertTriangle, Search, GitPullRequest, ExternalLink, Loader2, ThumbsUp, ThumbsDown, UserCircle } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import BN from "bn.js";
import { useWallet } from '@solana/wallet-adapter-react'
import { setupDAO } from '@/utils/helper'
import { daoAccountKeyPair } from '@/utils/keypair'
import toast from 'react-hot-toast'
import * as solanaWeb3 from "@solana/web3.js";
import auditorProgramJSON from "@/json/auditor.json";
import { Program } from '@coral-xyz/anchor'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { getAllRepos } from '@/lib/features/reposSlice'
import { useAppDispatch } from '@/lib/hooks'

export interface Proposal {
    daoOwner: string;           
    description: string;        
    finalized: boolean;         
    fundsAllocated: BN;         
    id: string;                 
    proposer: string;           
    title: string;              
    votedByCreator: boolean;    
    votedByVerifier: boolean;   
    votesAgainst: BN;           
    votesFor: BN;               
    status?: 'active' | 'ended';
    deadline?: string;
    githubPR?: string;
    rewardOwnerCount?: number;
}

interface RepoProposalModalProps {
    repo: any;
    isOpen: boolean;
    onClose: () => void;
}

const formatVotes = (votes: any): string => {
    const voteStr = votes?.toString() || "0";
    return Number(voteStr.replace(/"/g, '')).toString();
}

export default function RepoProposalModal({ repo, isOpen, onClose }: RepoProposalModalProps) {
    const router = useRouter()
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useAppDispatch();

    const [votedProposals, setVotedProposals] = useState<number[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOption, setSortOption] = useState("newest")
    const wallet = useWallet();
    const connection = setupDAO.getConnection();
    const { provider, daoProvider } = setupDAO.getProvider(connection, wallet, daoAccountKeyPair);
  

    useEffect(() => {
        if (repo?.proposals.length === 0) {
            onClose()
        }
    }, [])

    useEffect(() => {
        if (repo?.proposals) {
            setProposals(repo.proposals)
            setIsLoading(false)
        }
    }, [repo])


    const handleVote = async (repoName: string, proposalTitle: string, proposalDeadline: number, voteChoice: boolean) => {
        try {

            if (!wallet || !wallet.publicKey) {
                toast.error("connect your wallet");
                return;
            }
            if (!repoName && !proposalTitle && !proposalDeadline && !voteChoice) {
                toast.error("fields error!")
                return;
            }
            const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);
            const ownerPubkey = new solanaWeb3.PublicKey(repo.owner.toString());

            const transaction = await (program.methods as any)
                .vote(
                    ownerPubkey, 
                    repoName,
                    `${repoName}/${proposalTitle}/${proposalDeadline}`,
                    voteChoice
                )
                .accounts({
                    daoAccount: daoAccountKeyPair.publicKey,
                    voter: wallet.publicKey,
                    systemProgram: solanaWeb3.SystemProgram.programId,
                })
                .transaction();

            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // const signedTransaction = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
            const signedTransaction = await wallet.signTransaction!(transaction);
            const tx = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(tx);
            dispatch(getAllRepos(wallet));
            toast.success('Voted successfully');
        } catch (error) {
            console.log('error-->',error)
            toast.error(`Failed to vote`)
        }
    }
    
    const handleClaimRewards = async (repoName: string, proposalTitle: string, proposalDeadline: number) => {
        try {
            if (!wallet || !wallet.publicKey) {
                toast.error("connect your wallet");
                return;
            }

            const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);
            const transaction = await (program.methods as any).claimReward(wallet.publicKey, repoName, `${repoName}/${proposalTitle}/${proposalDeadline}`)
            .accounts({
                daoAccount: daoAccountKeyPair.publicKey,
                auditor: wallet.publicKey,
                systemProgram: solanaWeb3.SystemProgram.programId,
            })
            .transaction();

            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTransaction = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
            await connection.confirmTransaction(signedTransaction);
            dispatch(getAllRepos(wallet));
            toast.success('Rewards claimed successfully');
        } catch (error) {
            console.log(error)
            toast.error(`Failed to claim rewards`)
        }
    }

    const isVotingEnded = (repo: any): boolean => {
        if (repo?.status?.active || repo?.finalized == false) {
            return false
        }
        return true
    }

    

    // Add debouncing for search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)
        
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Updated filtering and sorting logic
    const getFilteredProposals = () => {
        if (!proposals) return []

        return proposals
            .filter((proposal: Proposal) => {
                // Search filter
                const matchesSearch = debouncedSearchTerm === "" || 
                    proposal.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    proposal.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

                // Status filter
                const matchesStatus = statusFilter === "all" || 
                    (statusFilter === "active" && !proposal.finalized) ||
                    (statusFilter === "ended" && proposal.finalized)

                return matchesSearch && matchesStatus
            })
            .sort((a: Proposal, b: Proposal) => {
                // Convert deadline strings to numbers for comparison
                const dateA = Number(a.deadline) || 0
                const dateB = Number(b.deadline) || 0

                return sortOption === "newest" 
                    ? dateB - dateA  // Newest first
                    : dateA - dateB  // Oldest first
            })
    }

    const filteredAndSortedProposals = getFilteredProposals()

    // Update the repoInfo to use the passed repo data
    const repoInfo = {
        name: repo?.name,
        description: repo?.description,
        stars: repo?.stars || 0,
        forks: repo?.forks || 0,
        openIssues: repo?.openIssues || 0,
    }

    console.log('proposals', proposals)

    return (
        <div className={`fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto ${!isOpen && 'hidden'}`}>
            <header className="sticky top-0 bg-white dark:bg-black shadow-sm z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            className="mr-4 -ml-2"
                            onClick={onClose}  // Updated to use onClose prop
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{repoInfo.name} Proposals</h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{repoInfo.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                        <Badge variant="secondary">⭐ {repoInfo.stars} stars</Badge>
                        <Badge variant="secondary">🍴 {repoInfo.forks} forks</Badge>
                        <Badge variant="secondary">🐛 {repoInfo.openIssues} open issues</Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-6 px-4">
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

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                ) : filteredAndSortedProposals.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredAndSortedProposals.map((proposal: Proposal) => (
                            <motion.div
                                key={proposal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-4">
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-medium">{proposal.title}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    #{proposal.id}
                                                </Badge>
                                                {proposal.githubPR && (
                                                    <Link
                                                        href={proposal.githubPR}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                    >
                                                        <GitPullRequest className="w-4 h-4 mr-1" />
                                                        View PR
                                                        <ExternalLink className="w-3 h-3 ml-1" />
                                                    </Link>
                                                )}
                                            </div>
                                            <ProposalStatus repo={repo} />
                                        </div>

                                        {/* Main Content Row */}
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            {/* Description */}
                                            <div className="col-span-5">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {proposal.description}
                                                </p>
                                            </div>

                                            {/* Voting Stats */}
                                            <div className="col-span-3 flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                                            {formatVotes(proposal.votesFor)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">For</span>
                                                    </div>
                                                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-red-600 dark:text-red-400 font-semibold">
                                                            {formatVotes(proposal.votesAgainst)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Against</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Verification Status */}
                                            <div className="col-span-3 flex items-center gap-2">
                                                <Badge
                                                    variant={proposal.votedByCreator ? "outline" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {proposal.votedByCreator ? (
                                                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 mr-1 text-gray-500" />
                                                    )}
                                                    Creator
                                                </Badge>
                                                <Badge
                                                    variant={proposal.votedByVerifier ? "outline" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {proposal.votedByVerifier ? (
                                                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 mr-1 text-gray-500" />
                                                    )}
                                                    Verifier
                                                </Badge>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-1 flex justify-end gap-2">
                                                {!isVotingEnded(repo) ? (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            onClick={() => handleVote(repo.name, proposal.title, Number(proposal.deadline), true)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            <ThumbsUp className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleVote(repo.name, proposal.title, Number(proposal.deadline), false)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <ThumbsDown className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">Ended</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer - Proposer */}
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <UserCircle className="w-3 h-3 mr-1" />
                                                Proposer:
                                                <span className="font-mono ml-1">
                                                    {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                                                </span>
                                            </div>
                                            { (proposal.proposer.toString() == wallet?.publicKey?.toString() && proposal.finalized) &&
                                                <div className="flex gap-1 items-center text-blue-600 hover:text-white hover:border-white rounded-md border border-blue-600">
                                                <Button variant="ghost" size="sm" onClick={() => handleClaimRewards(repo.name, proposal.title, Number(proposal.deadline))}>
                                                    Claim {Number(proposal.fundsAllocated.div(new BN(10).pow(new BN(9))).toString())/(proposal.rewardOwnerCount || 1)} SOL
                                                </Button>
                                            </div>
                                            }
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No proposals found</p>
                    </div>
                )}
            </main>
        </div>
    )
}

function formatDate(date: string) {
    return new Date(Number(date) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function ProposalStatus({ repo }: { repo: any }) {
    const formattedStartDate = formatDate(repo?.postedTime.toNumber())
    const isActive = repo?.status?.active

    return (
        <div className="flex items-center gap-2">
            <Badge className="bg-gray-500 text-white">
                <Clock className="w-4 h-4 mr-1" />
                Started {formattedStartDate}
            </Badge>
            <Badge className={`${isActive ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {isActive ? 'Active' : 'Inactive'}
            </Badge>
        </div>
    )
}