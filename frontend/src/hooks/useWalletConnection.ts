import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UseWalletConnectionReturn {
  connected: boolean;
  publicKey: PublicKey | null;
  walletAddress: string | null;
  balance: number | null;
  connecting: boolean;
  disconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  sendSol: (recipient: string, amount: number) => Promise<string | null>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  loading: boolean;
  error: Error | null;
}

export const useWalletConnection = (
  endpoint: string = process.env.REACT_APP_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
): UseWalletConnectionReturn => {
  const {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    select,
    connect: connectWallet,
    disconnect: disconnectWallet,
    signTransaction,
    signAllTransactions,
    signMessage: signWalletMessage,
  } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    try {
      const connection = new Connection(endpoint);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch balance'));
    }
  }, [publicKey, endpoint]);

  // Update balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      getBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, getBalance]);

  // Connect to wallet
  const connect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!wallet) {
        throw new Error('No wallet selected');
      }
      
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error instanceof Error ? error : new Error('Failed to connect wallet'));
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      await disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError(error instanceof Error ? error : new Error('Failed to disconnect wallet'));
    } finally {
      setLoading(false);
    }
  };

  // Send transaction
  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new WalletNotConnectedError();
    }

    try {
      setLoading(true);
      setError(null);
      
      const connection = new Connection(endpoint);
      
      // Set the fee payer and recent blockhash
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      
      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm the transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError(error instanceof Error ? error : new Error('Failed to send transaction'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send SOL to a recipient
  const sendSol = async (recipient: string, amount: number): Promise<string | null> => {
    if (!publicKey || !signTransaction) {
      throw new WalletNotConnectedError();
    }

    try {
      setLoading(true);
      setError(null);
      
      const connection = new Connection(endpoint);
      const recipientPubKey = new PublicKey(recipient);
      
      // Create a transfer instruction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      
      // Set the fee payer and recent blockhash
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      
      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm the transaction
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Update balance after sending SOL
      await getBalance();
      
      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      setError(error instanceof Error ? error : new Error('Failed to send SOL'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign a message
  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!signWalletMessage) {
      throw new WalletNotConnectedError();
    }

    try {
      setLoading(true);
      setError(null);
      return await signWalletMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      setError(error instanceof Error ? error : new Error('Failed to sign message'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    connected,
    publicKey,
    walletAddress: publicKey ? publicKey.toString() : null,
    balance,
    connecting,
    disconnecting,
    connect,
    disconnect,
    sendTransaction,
    sendSol,
    signMessage,
    loading,
    error,
  };
};

export default useWalletConnection;
