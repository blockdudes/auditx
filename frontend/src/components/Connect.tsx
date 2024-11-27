"use client"
import React from 'react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

const Connect = () => {
    return (
        <div>
            <WalletMultiButton style={{
                padding: '10px 20px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
            }} />
        </div>
    )
}

export default Connect
