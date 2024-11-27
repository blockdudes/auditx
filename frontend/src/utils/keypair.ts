import { web3 } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js';

class CustomWallet {
    constructor(private keypair: Keypair) { }

    get publicKey() {
        return this.keypair.publicKey;
    }

    signTransaction(tx: solanaWeb3.Transaction) {
        tx.partialSign(this.keypair);
        return Promise.resolve(tx);
    }

    signAllTransactions(txs: solanaWeb3.Transaction[]) {
        return Promise.all(txs.map((tx) => {
            tx.partialSign(this.keypair);
            return tx;
        }));
    }
}

export function getKeypairFromSecretKey(secretKeyArray: string | number[]) {
    const secretKey = typeof secretKeyArray === 'string'
        ? bs58.decode(secretKeyArray)
        : new Uint8Array(secretKeyArray);
    return web3.Keypair.fromSecretKey(secretKey);
}

export const deployerKeyPair = web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_DEPLOYER_SECRET_KEY!));
export const daoAccountKeyPair = web3.Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_DAO_ACCOUNT_SECRET_KEY!));
// export const daoAccountKeyPair = web3.Keypair.generate();

export const deployerWallet = () => {
    return new CustomWallet(deployerKeyPair);
}  