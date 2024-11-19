// "use client"
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { client, wallet } from "@/config/thirdwebConfig";
// import { injectedProvider } from "thirdweb/wallets";

// export interface userWalletInitialStateType {
//     signer: null | any;
//     clientSigner: null | any;
//     client: null | any;
//     loading: boolean;
//     chain: null | any;
//     error: null | any;
// }

// const userWalletInitialState: userWalletInitialStateType = {
//     signer: null,
//     clientSigner: null,
//     client: null,
//     loading: false,
//     chain: null,
//     error: null,
// }

// export const connectWallet = createAsyncThunk("connectWallet", async () => {
//     try {

//         if (injectedProvider("app.backpack")) {
//             await wallet.connect({ client });
//         } else {
//             await wallet.connect({
//                 client,
//                 walletConnect: { showQrModal: true },
//             });
//         }

//         return {
//             signer: "signer",
//             clientSigner: "client signer",
//             chain: "SOLANA TESTNET",
//             client: "client",
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// export const connectSlice = createSlice({
//     name: "connect wallet slice",
//     initialState: userWalletInitialState,
//     extraReducers: builder => {
//         builder.addCase(connectWallet.pending, (state) => {
//             state.loading = true;
//         })
//         builder.addCase(connectWallet.fulfilled, (state, action) => {
//             state.loading = false;
//             state.signer = action?.payload?.signer;
//             state.clientSigner = action?.payload?.clientSigner;
//             state.client = action?.payload?.client;
//             state.chain = action?.payload?.chain;
//             state.error = null;
//         })
//         builder.addCase(connectWallet.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.error.message;
//             state.signer = null;
//             state.clientSigner = null;
//             state.client = null;
//         })
//     },
//     reducers: {
//         disconnect: () => {
//             return userWalletInitialState
//         }
//     }
// })

// export const { disconnect } = connectSlice.actions
// export default connectSlice.reducer;