"use client"
import { AnchorProvider, Program, setProvider, web3 } from "@coral-xyz/anchor";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clusterApiUrl } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js';
import audiorProgramJSON from "@/json/auditor.json";
import { daoAccountKeyPair, deployerKeyPair } from "@/utils/keypair";

export interface allReposInitialStateType {
    repos: any[];
    error: any | null;
    loading: boolean;
}

const allReposInitialState: allReposInitialStateType = {
    repos: [],
    error: null,
    loading: false
}

export const getAllRepos = createAsyncThunk("GET_ALL_REPOS", async (wallet: any, { rejectWithValue }) => {
    try {
        if (!wallet || !wallet.publicKey) {
            console.error("Wallet or wallet.publicKey is undefined.");
            return;
        }
        const connection = new solanaWeb3.Connection(clusterApiUrl("devnet"), "confirmed");
        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        setProvider(provider);
        const auditorProgram = new Program(JSON.parse(JSON.stringify(audiorProgramJSON)), provider);
        const allRepos = await (auditorProgram.account as any).daoState.fetch(daoAccountKeyPair.publicKey);
        return { repos: [allRepos] || [] };
    } catch (error) {
        rejectWithValue({ error })
    }
});

export const reposSlice = createSlice({
    name: "All Repos Data",
    initialState: allReposInitialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getAllRepos.pending, (state, action) => {
                state.error = null;
                state.loading = true;
                state.repos = [];
            })
            .addCase(getAllRepos.fulfilled, (state, action) => {
                state.error = null;
                state.loading = false;
                state.repos = action.payload?.repos ?? [];
            })
            .addCase(getAllRepos.rejected, (state, action) => {
                state.error = action.error;
                state.loading = false;
                state.repos = [];
            })
    }
});

export default reposSlice.reducer;