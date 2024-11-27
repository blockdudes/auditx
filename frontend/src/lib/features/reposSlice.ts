"use client"
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clusterApiUrl } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js';
import audiorProgramJSON from "@/json/auditor.json";
import { daoAccountKeyPair } from "@/utils/keypair";

// Define the initial state type
export interface allReposInitialStateType {
  repos: any[];
  error: any | null;
  loading: boolean;
}

const allReposInitialState: allReposInitialStateType = {
  repos: [],
  error: null,
  loading: false
};

// Set up the connection and DAO provider
const connection = new solanaWeb3.Connection("https://rpc.testnet.soo.network/rpc", "confirmed");

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

export const getAllRepos = createAsyncThunk("GET_ALL_REPOS", async (wallet: any, { rejectWithValue }) => {
    try {
        if (!wallet || !wallet.publicKey) {
            return rejectWithValue("No wallet or publicKey found");
        }

        const repositories: any[] = [];
        const provider = daoProvider;
        const auditorProgram = new Program(
            JSON.parse(JSON.stringify(audiorProgramJSON)),
            daoProvider
        );

        const account = await (auditorProgram.account as any).daoState.fetch(daoAccountKeyPair.publicKey);

        if (account.clients && Array.isArray(account.clients)) {
            account.clients.forEach((client: any) => {
                if (client.state && Array.isArray(client.state.repositories)) {
                    client.state.repositories.forEach((repo: any) => {
                        // Convert daoOwner and proposals.daoOwner (if it's a PublicKey) to a string
                        if (repo.daoOwner instanceof solanaWeb3.PublicKey) {
                            repo.daoOwner = repo.daoOwner.toString(); // Convert to string
                        }

                        // Convert proposer to string (if it's a PublicKey)
                        if (Array.isArray(repo.proposals)) {
                            repo.proposals.forEach((proposal: any) => {
                                if (proposal.daoOwner instanceof solanaWeb3.PublicKey) {
                                    proposal.daoOwner = proposal.daoOwner.toString(); // Convert to string
                                }

                                // Convert proposer (if it's a PublicKey) to string
                                if (proposal.proposer instanceof solanaWeb3.PublicKey) {
                                    proposal.proposer = proposal.proposer.toString(); // Convert to string
                                }

                                // Convert votesFor to a serializable type (string or number)
                                if (proposal.votesFor && typeof proposal.votesFor === 'object') {
                                    proposal.votesFor = JSON.stringify(proposal.votesFor); // Convert to string
                                }
                            });
                        }

                        repositories.push(repo);
                    });
                }
            });
        }

        return { repos: repositories || [] };
    } catch (error: any) {
        console.error("Error fetching repos:", error);
        return rejectWithValue(error.message || "An error occurred while fetching repositories.");
    }
});



// Slice to handle state updates
export const reposSlice = createSlice({
  name: "All Repos Data",
  initialState: allReposInitialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllRepos.pending, (state) => {
        state.error = null;
        state.loading = true;
        state.repos = [];
      })
      .addCase(getAllRepos.fulfilled, (state, action) => {
        console.log("Fulfilled action payload:", action.payload);
        state.error = null;
        state.loading = false;
        state.repos = action.payload?.repos ?? [];
      })
      .addCase(getAllRepos.rejected, (state, action) => {
        state.error = action.payload || action.error;
        state.loading = false;
        state.repos = [];
      });
  }
});

export default reposSlice.reducer;
