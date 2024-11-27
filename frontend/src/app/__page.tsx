'use client'
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { FAQs } from "@/containers/landing/FAQs";
import { Features } from "@/containers/landing/features";
import { Hero } from "@/containers/landing/hero";
import { LogoTicker } from "@/containers/landing/logoTicker";
import { ProductShowcase } from "@/containers/landing/productShowcase";
import { Connection, clusterApiUrl, PublicKey, Keypair } from '@solana/web3.js';
import { useAnchorWallet, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { useState } from "react";
import { useEffect } from "react";
import { AlphaWalletAdapter } from '@solana/wallet-adapter-wallets';
import Connect from "@/components/Connect";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { daoAccountKeyPair, deployerKeyPair, deployerWallet } from "@/utils/keypair";
import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import * as solanaWeb3 from "@solana/web3.js";
import auditorProgramJSON from "@/json/auditor.json";
import toast from "react-hot-toast";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { getAllRepos } from "@/lib/features/reposSlice";

export default function Home() {

    const [repoName, setRepoName] = useState("null");
    const [repoURL, setRepoURL] = useState("https://github.com/blockdudes/Includer");

    const router = useRouter();
    const anchorWallet = useAnchorWallet();
    const wallet = useWallet();
    const dispatch = useAppDispatch();
    const deployer = deployerWallet();
    // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // const connection = new Connection("https://rpc.devnet.soo.network/rpc", "confirmed");
    const connection = new Connection("https://rpc.testnet.soo.network/rpc", "confirmed");
    const provider = new AnchorProvider(connection, anchorWallet!, { commitment: "confirmed" })
    setProvider(provider);
    console.log(daoAccountKeyPair.publicKey.toBase58());

    const key = new PublicKey(daoAccountKeyPair.publicKey);
    console.log(key);
    // page content 1. show all the repos on the page 
    // fetch from the contract...
    const { repos, loading, error } = useAppSelector((state) => state.repos)

    console.log('repos',repos)
    const daoPublicKey = new PublicKey("7tXD1cRC4DsRd7Lnjm8PUajnh47fuHbwCWWZ4KUfLwMG");

    const daoProvider = new AnchorProvider(
        connection,
        {
            publicKey: daoAccountKeyPair.publicKey,
            signTransaction: async (tx: any) => {
                tx.partialSign(daoAccountKeyPair);
                return tx;
            },
            signAllTransactions: async (txs: any[]) => {
                txs.forEach(tx => tx.partialSign(daoAccountKeyPair));
                return txs;
            }
        },
        { commitment: "confirmed" }
    );


    const handleInitializeDao = async () => {
        // const daoAccount = [88,226,187,126,48,90,133,83,11,159,51,106,52,101,203,36,205,46,160,247,114,153,41,74,50,115,61,209,122,66,168,112,250,73,226,141,187,201,202,157,27,103,127,53,63,59,31,29,45,17,73,202,103,42,234,54,96,38,228,155,251,80,214,205]
        // const daoAccountKeyPair = Keypair.fromSecretKey(new Uint8Array(daoAccount));
        // console.log('secretKey',bs58.encode(daoAccountKeyPair.secretKey));
        // // console.log(daoAccountKeyPair.secretKey.toBase58());
        // return;
        try {
            if (!wallet || !wallet.publicKey) {
                toast.error("connect your wallet");
                return;
            }
            if (!repoName && !repoURL) {
                toast.error("fields error!")
                return;
            }

            const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);

            await (program.methods as any).initialize().accounts({
                daoAccount: daoAccountKeyPair.publicKey,
                verifier: deployerKeyPair.publicKey,
            }).signers([daoAccountKeyPair, deployerKeyPair])
            .rpc();

            const account = await (program.account as any).daoState.fetch(daoAccountKeyPair.publicKey);
            console.log('account', account);

            toast.success("DAO initialized successfully!");
        } catch (error) {
            console.log(error)
            toast.error(`${error}`);
        }
    }

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

    const handleCreateRepository = async (githubUrl: string, repoName: string, repoDescription: string) => {
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

            const transaction = await (program.methods as any).createRepository(repoName,repoDescription, githubUrl, new BN(1000))
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
            console.log(error)
            toast.error(`${error}`)
        }
    }

    const handleCreateProposal = async (repoName: string,githubPr: string, proposalTitle: string, proposalDescription: string, proposalDeadline: number) => {
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


            const transaction = await (program.methods as any).createProposal(wallet.publicKey, repoName, githubPr, proposalTitle, proposalDescription, new BN(proposalDeadline))
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
            console.log('signedTransaction', signedTransaction);

              
        } catch (error) {
            console.log(error)
            toast.error(`${error}`)
        }
    }

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

            const transaction = await (program.methods as any)
                .vote(
                    wallet.publicKey, 
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
            console.log('signedTransaction', tx);
        } catch (error) {
            console.log(error)
            toast.error(`${error}`)
        }
    }

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
            console.log('signedTransaction', signedTransaction);
        } catch (error) {
            console.log(error)
            toast.error(`${error}`)
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
            console.log('signedTransaction', signedTransaction);
        } catch (error) {
            console.log(error)
            toast.error(`${error}`)
        }
    }

    const fundDaoAccount = async (amount: number) => {
        try {
            if (!wallet || !wallet.publicKey) {
                toast.error("connect your wallet");
                return;
            }
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: daoAccountKeyPair.publicKey,
                    lamports: solanaWeb3.LAMPORTS_PER_SOL * amount, // Sending 1 SOL
                })
            );

            const signature = await provider.sendAndConfirm(
                transaction,
                [] // No additional signers needed since anchorWallet will sign
            );

            console.log('Fund transfer signature:', signature);
            toast.success(`Successfully funded DAO account with ${amount} SOL`);
        } catch (error) {
            console.error('Error funding account:', error);
            toast.error('Failed to fund DAO account');
        }
    };

    const getDaoAccount = async () => {
        const program = new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);
        const account = await (program.account as any).daoState.fetch(daoAccountKeyPair.publicKey);
        console.log('account', account);
    }

    return (
        <div className="overflow-x-hidden">
            <div className="w-full flex flex-col m-10 justify-center items-center gap-10">
                <Connect />
                <button onClick={() => getDaoAccount()} className="bg-blue-500 text-white p-2 rounded-md">Get DAO Account</button>
                <button onClick={() => handleInitializeDao()} className="bg-blue-500 text-white p-2 rounded-md">Initialize DAO</button>
                <button onClick={() => handleInitializeClient("client_001")} className="bg-blue-500 text-white p-2 rounded-md">Initialize Client</button>
                <button onClick={() => handleCreateRepository(
                    "github.com/acme-corp/project-alpha",
                    "acme_audit_2024", 
                    "project_alpha_v1"
                )} className="bg-blue-500 text-white p-2 rounded-md">Create Repo</button>
                <button onClick={() => handleCreateProposal(
                    "acme_audit_2024",
                    "github.com/acme-corp/project-alpha",
                    "project_alpha_v1",
                    "security_audit_q1",
                    1832349951
                )} className="bg-blue-500 text-white p-2 rounded-md">Create Proposal</button>
                <button onClick={() => handleVote(
                    "acme_audit_2024",
                    "project_alpha_v1",
                    1832349951,
                    true
                )} className="bg-blue-500 text-white p-2 rounded-md">Vote</button>
                <button onClick={() => handleFinalizeAllProposals("acme_audit_2024")} className="bg-blue-500 text-white p-2 rounded-md">Finalize Proposals</button>
                <button onClick={() => handleClaimRewards(
                    "acme_audit_2024",
                    "security_audit_q1",
                    1000
                )} className="bg-blue-500 text-white p-2 rounded-md">Claim Rewards</button>
                </div>

        </div>
    );
}
