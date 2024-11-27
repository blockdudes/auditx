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
import { setupDAO } from "@/utils/helper"
import { useWallet } from "@solana/wallet-adapter-react"
import { daoAccountKeyPair } from "@/utils/keypair"
import toast from "react-hot-toast"
import auditorProgramJSON from "@/json/auditor.json";
import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import * as solanaWeb3 from "@solana/web3.js";
import { getAllRepos } from "@/lib/features/reposSlice"
import { useAppDispatch } from "@/lib/hooks"
import { useSession } from "next-auth/react"

export default function SubmitRepoPage() {
  const dispatch = useAppDispatch();
  
  // State for form fields
  const [formData, setFormData] = useState({
    githubUrl: '',
    projectName: '',
    contractType: '',
    description: '',
    reward: ''
  });

  const session = useSession();
  console.log('session', session)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const wallet = useWallet();
  const connection = setupDAO.getConnection();
  const { provider, daoProvider } = setupDAO.getProvider(connection, wallet, daoAccountKeyPair);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine contract type with description
    const fullDescription = `Contract Type: ${formData.contractType}\n\n${formData.description}`;
    
    try {

      await handleInitializeClient(session.data?.user?.email);

      await handleCreateRepository(
        formData.githubUrl,
        formData.projectName,
        fullDescription,
        Number(formData.reward) * 10 ** 9
      );
      
      // Clear form after successful submission
      setFormData({
        githubUrl: '',
        projectName: '',
        contractType: '',
        description: '',
        reward: ''
      });
      dispatch(getAllRepos(wallet));
      
      toast.success('Repository submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit repository');
    }
  };


  const handleInitializeClient = async (githubUsername: string) => {
    try {
        if (!wallet || !wallet.publicKey) {
            toast.error("connect your wallet");
            return;
        }

        const balance = await connection.getBalance(wallet.publicKey);
        console.log(`Wallet Balance: ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL`);

        const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);
        const transaction = await (program.methods as any)
            .initializeClient(wallet.publicKey, githubUsername)
            .accounts({
                daoAccount: daoAccountKeyPair.publicKey,
                client: wallet.publicKey,
                systemProgram: solanaWeb3.SystemProgram.programId,
            })
            .transaction();

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.sendTransaction(transaction, connection);
        console.log('signedTransaction', signedTransaction);
    } catch (error) {
        console.log(error)
        toast.error(`${error}`)
    }
}


  const handleCreateRepository = async (githubUrl: string, repoName: string, repoDescription: string, reward: number) => {
    try {
        if (!wallet || !wallet.publicKey) {
            toast.error("connect your wallet");
            return;
        }
        if (!repoName && !githubUrl) {
            toast.error("fields error!")
            return;
        }

        const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);

        const transaction = await (program.methods as any).createRepository(repoName,repoDescription, githubUrl, new BN(reward))
            .accounts({
                daoAccount: daoAccountKeyPair.publicKey,
                caller: wallet.publicKey,
                systemProgram: solanaWeb3.SystemProgram.programId,
            })
            .transaction()

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        
        const signedTransaction = await wallet.signTransaction!(transaction);

        const tx = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(tx);
        console.log('signedTransaction', tx);

    } catch (error) {
        throw error;
    }
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
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="repo-url" className="text-sm font-medium">GitHub Repository URL</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="repo-url" 
                      value={formData.githubUrl}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      placeholder="https://github.com/yourusername/your-repo" 
                      className="pl-9" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="project-name" className="text-sm font-medium">Project Name</label>
                  <Input 
                    id="project-name" 
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="Enter your project name" 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contract-type" className="text-sm font-medium">Contract Type</label>
                  <Select 
                    value={formData.contractType}
                    onValueChange={(value) => handleInputChange('contractType', value)}
                  >
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
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a brief description of your project and the smart contracts to be audited" 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="reward" className="text-sm font-medium">Audit Reward (USDC)</label>
                  <Input 
                    id="reward" 
                    type="number"
                    value={formData.reward}
                    onChange={(e) => handleInputChange('reward', e.target.value)}
                    placeholder="Enter the reward amount in USDC" 
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Submit Repository for Audit
                </Button>
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