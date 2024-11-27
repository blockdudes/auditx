import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from 'react-hot-toast'
import { setupDAO } from '@/utils/helper'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { daoAccountKeyPair } from '@/utils/keypair'
import auditorProgramJSON from "@/json/auditor.json";
import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import * as solanaWeb3 from "@solana/web3.js";
import { getAllRepos } from '@/lib/features/reposSlice'
import { useAppDispatch } from '@/lib/hooks'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

interface ApplyAuditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repoName: string
  repoOwner: string
  client: string
}




export function ApplyAuditModal({ 
  open, 
  onOpenChange,
  repoName,
  repoOwner,
  client
}: ApplyAuditModalProps) {
  const [proposalName, setProposalName] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [prUrl, setPrUrl] = useState('')

  const wallet = useWallet();
  const dispatch = useAppDispatch();  
  const connection = setupDAO.getConnection();
  const { provider, daoProvider } = setupDAO.getProvider(connection, wallet, daoAccountKeyPair);

  const handleCreateProposal = async (repoName: string, githubPr: string, proposalTitle: string, proposalDescription: string, proposalDeadline: number) => {

    console.log(repoName, githubPr, proposalTitle, proposalDescription, proposalDeadline)
    try {
        if (!wallet || !wallet.publicKey) {
            toast.error("connect your wallet");
            return;
        }
        if (!repoName && !proposalTitle && !proposalDescription && !proposalDeadline) {
            toast.error("fields error!")
            return;
        }
        const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);

        const clientPublicKey = new solanaWeb3.PublicKey(client);

        const transaction = await (program.methods as any).createProposal(clientPublicKey, repoName,githubPr, proposalTitle, proposalDescription, new BN(proposalDeadline))
        .accounts({
            daoAccount: daoAccountKeyPair.publicKey,
            creator: wallet.publicKey,
            systemProgram: solanaWeb3.SystemProgram.programId,
        })
        .transaction();

        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
        await connection.confirmTransaction(signedTransaction);
        dispatch(getAllRepos(wallet));
        console.log('signedTransaction', signedTransaction);
        toast.success('Proposal submitted successfully');
    } catch (error) {
        console.log(error)
        toast.error(`${error}`)
    } finally {
      onOpenChange(false);
    }
}
    


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply to Audit {repoName}</DialogTitle>
          <DialogDescription>
            Submit your application to audit {repoName}&apos;s repository. Provide details about your expertise and approach.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Proposal Name
            </Label>
            <Input 
              id="name" 
              className="col-span-3" 
              placeholder="Enter proposal name"
              value={proposalName}
              onChange={(e) => setProposalName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description & Approach
            </Label>
            <Textarea 
              id="description" 
              className="col-span-3" 
              placeholder="Describe your audit methodology and expertise"
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="githubPrUrl" className="text-right">
              Github PR Url
            </Label>
            <Textarea 
              id="githubPrUrl" 
              className="col-span-3" 
              placeholder="Github PR Url"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={() => handleCreateProposal(
              repoName,
              prUrl,
              proposalName,
              proposalDescription,
              new Date().getTime() + 10000 * 60 * 60 * 24 * 7
            )}
          >
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


