"use client"
import { getAllRepos } from "@/lib/features/reposSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { deployerWallet } from "@/utils/keypair";
import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import audiorProgramJSON from "@/json/auditor.json";
import { clusterApiUrl } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js';

export default function Repository({ repoId }: { repoId: string }) {
    const [proposalTitle, setProposalTitle] = useState(null);
    const [proposalDescription, setProposalDescription] = useState(null);
    const [vote, setVote] = useState(false);

    const anchorWallet = useAnchorWallet();
    const connection = new solanaWeb3.Connection("https://rpc.testnet.soo.network/rpc", "confirmed");
    const provider = new AnchorProvider(connection, anchorWallet!, { commitment: "confirmed" })
    setProvider(provider);

    const dispatch = useAppDispatch();
    const repos = useAppSelector(state => state.repos);
    const deployer = deployerWallet();
    const wallet = useWallet();
    const repo = repos.repos.find(item => item.repoId === repoId) || {
        repoId: 1,
        repoUrl: "https://github.com/blockdudes/ZeniFi/tree/main",
        repoName: "HELL",
        repoPr: []
    };

    console.log(repo);

    useEffect(() => {
        if (!deployer || !deployer.publicKey) {
            console.log("Wallet or wallet.publicKey is undefined.");
            return;
        } else {
            console.log("HERE!");
            dispatch(getAllRepos(deployer));
        }
    }, []);

    const handleCreateProposal = async () => {
        try {
            if (!wallet.connected) {
                toast.error("connect your wallet");
                return;
            }
            if (!proposalTitle || !proposalDescription) {
                toast.error("Please fill in all fields");
                return;
            }
            const program = new Program(JSON.parse(JSON.stringify(audiorProgramJSON)), provider);
            const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days in seconds
            const tx = await (program.methods as any).createProposal(
                repo.repoName,
                proposalTitle,
                proposalDescription,
                new BN(deadline))
                .accounts({
                    daoAccount: program.programId,
                    daoOwner: wallet.publicKey,
                    systemProgram: solanaWeb3.SystemProgram.programId,
                }).rpc();
            toast.success("Proposal created successfully!");
            dispatch(getAllRepos(deployer));
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    const handleProposalVoting = async (proposalId: string) => {
        try {
            if (!wallet.connected) {
                toast.error("connect your wallet");
                return;
            }
            if (!proposalId) {
                toast.error("Please fill in all fields");
                return;
            }
            const program = new Program(JSON.parse(JSON.stringify(audiorProgramJSON)), provider);
            const tx = await (program.methods as any).createProposal(
                repo.repoName,
                proposalId,
                vote)
                .accounts({
                    daoAccount: program.programId,
                    voter: wallet.publicKey,
                    systemProgram: solanaWeb3.SystemProgram.programId,
                }).rpc();
            toast.success("Vote submitted successfully!");
            dispatch(getAllRepos(deployer));
        } catch (error) {
            toast.error(`${error}`);
        }
    }



    return (
        <div>
            Repository ID: {repoId}
        </div>
    );
}