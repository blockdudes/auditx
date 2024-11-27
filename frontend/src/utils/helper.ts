import { Connection, clusterApiUrl, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { WalletContextState } from '@solana/wallet-adapter-react';
import { daoAccountKeyPair } from "./keypair";
import auditorProgramJSON from "@/json/auditor.json";
import toast from "react-hot-toast";

export const setupDAO = {
  // Initialize connection and provider
  getConnection: () => {
    // return new Connection(clusterApiUrl("devnet"), "confirmed");
    return new Connection("https://rpc.testnet.soo.network/rpc", "confirmed");
  },

  getProvider: (
    connection: Connection, 
    wallet: WalletContextState, 
    daoAccountKeyPair: Keypair
  ) => {
    // Provider for wallet interactions
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: "confirmed" }
    );

    // Provider for DAO account interactions
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

    return { provider, daoProvider };
  },

  // Get program instance
  getProgram: (daoProvider: AnchorProvider) => {
    return new Program(JSON.parse(JSON.stringify(auditorProgramJSON)), daoProvider);
  },

  // Check wallet connection
  checkWalletConnection: (wallet: WalletContextState) => {
    if (!wallet || !wallet.publicKey) {
      toast.error("Connect your wallet");
      return false;
    }
    return true;
  }
};