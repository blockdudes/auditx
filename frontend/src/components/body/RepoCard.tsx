// /components/RepoCard.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Github, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ApplyAuditModal } from './AuditApplyModal'
import { useState } from 'react'
import { setupDAO } from "@/utils/helper";
import { useWallet } from "@solana/wallet-adapter-react";
import { daoAccountKeyPair } from "@/utils/keypair";
import toast from 'react-hot-toast'
import * as solanaWeb3 from "@solana/web3.js";
import auditorProgramJSON from "@/json/auditor.json";
import { Program } from "@coral-xyz/anchor";
import { getAllRepos } from "@/lib/features/reposSlice";
import { useAppDispatch } from "@/lib/hooks";
export default function RepoCard({
  logo,
  name,
  owner,
  status,
  reward,
  postedTime,
  description,
  repoUrl,
  onClick,
  isOwner,
}: {
  logo: string;
  name: string;
  owner: string;
  status: string;
  reward: string;
  postedTime: string;
  description: string;
  repoUrl: string;
  onClick?: () => void;
  isOwner: boolean;
}) {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!showModal && onClick && !e.defaultPrevented) {
      onClick();
    }
  };

  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const connection = setupDAO.getConnection();
  const { provider, daoProvider } = setupDAO.getProvider(connection, wallet, daoAccountKeyPair);

  const handleFinalizeAllProposals = async (repoName: string) => {
    try {
      if (!wallet || !wallet.publicKey) {
        toast.error("connect your wallet");
        return;
      }

      if (!repoName) {
        toast.error("fields error!")
        return;
      }

      const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);
      const transaction = await (program.methods as any).finalizeAllProposals(wallet.publicKey, repoName)
        .accounts({
          daoAccount: daoAccountKeyPair.publicKey,
          client: wallet.publicKey,
          systemProgram: solanaWeb3.SystemProgram.programId,
        })
        .transaction();

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
      await connection.confirmTransaction(signedTransaction);
      dispatch(getAllRepos(wallet));
      toast.success('Proposals finalized successfully');
    } catch (error) {
      console.log(error)
      toast.error(`Failed to finalize proposals`)
    }
  }


  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div>
        <Card
          className="p-6 hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.stopPropagation();
            if (!showModal) {
              onClick && onClick();
            }
          }}
        >
          <div className="flex gap-4">
            <Image
              src={logo}
              alt={`${owner} logo`}
              width={20}
              height={20}
              className="rounded-md w-10 h-10"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Link
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <Github className="inline-block w-4 h-4 mr-1" />
                  View Repo
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {status}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  💰 {reward}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Owner: {owner}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Posted {new Date(Number(postedTime) * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex flex-col gap-2 items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isOwner && status === "Inactive"}
                    className={`${isOwner
                      ? "text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-600"
                      : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-600"
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // Case 1: Owner viewing inactive repo - can't finalize
                      if (isOwner && status === "Inactive") {
                        return;
                      }

                      // Case 2: Owner viewing active repo - can finalize
                      if (isOwner && status === "Active") {
                        handleFinalizeAllProposals(name);
                        return;
                      }

                      // Case 3: Non-owner viewing active repo - can apply
                      if (!isOwner && status === "Active") {
                        setShowModal(true);
                        return;
                      }
                    }}
                  >
                    {status === "Inactive" ? (
                      <>
                        Already Finalized
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      isOwner ? (
                        <>
                          Finalize
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Apply for Audit
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )
                    )}

                  </Button>
                  {status === "Inactive" && <p className="text-xs text-muted-foreground">Already Finalized</p>}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ApplyAuditModal
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
        }}
        repoName={name}
        repoOwner={owner}
      />
    </motion.div>
  );
}
