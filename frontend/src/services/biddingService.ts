import { gql } from '@apollo/client';
import apolloClient from './apolloClient';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Bid } from '../components/nft/bids/BidsTable';
import { PublicKey } from '@solana/web3.js';

// Mock data for testing
const MOCK_BIDS: Bid[] = [
  {
    id: 'bid-1',
    price: 2.5,
    from: {
      id: 'user-1',
      walletAddress: '8YLKoCu3bqgaym9Z2W3EmSjAaQWgZwZ9kBJ4HaiNBvJE',
      username: 'CryptoCollector',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'bid-2',
    price: 3.0,
    from: {
      id: 'user-2',
      walletAddress: '6YvZdveiGvBuX9S4UBvnQCh9xUK8TZEjxQYjQQYC5Vqy',
      username: 'NFTEnthusiast',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'bid-3',
    price: 2.75,
    from: {
      id: 'user-3',
      walletAddress: '5FHwkrdxkRzDNhbxDF6rKyXY5FiPZZhSRxCxfL2Jg6Gg',
      username: 'SolanaTrader',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

// Function to generate a mock transaction signature
const generateMockSignature = () => {
  return Array.from({ length: 64 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
};

// GraphQL queries and mutations
const PLACE_BID = gql`
  mutation PlaceBid($nftId: ID!, $price: Float!, $expirationDays: Int!) {
    placeBid(nftId: $nftId, price: $price, expirationDays: $expirationDays) {
      id
      price
      from {
        id
        walletAddress
        username
      }
      expiresAt
      createdAt
    }
  }
`;

const CANCEL_BID = gql`
  mutation CancelBid($id: ID!) {
    cancelBid(id: $id) {
      id
      status
    }
  }
`;

const ACCEPT_BID = gql`
  mutation AcceptBid($id: ID!) {
    acceptBid(id: $id) {
      id
      type
      nft {
        id
        owner {
          id
          walletAddress
        }
        listed
      }
      from {
        id
        walletAddress
      }
      to {
        id
        walletAddress
      }
      price
      signature
      timestamp
    }
  }
`;

const GET_BIDS = gql`
  query GetBids($nftId: ID!) {
    bids(nftId: $nftId) {
      id
      price
      from {
        id
        walletAddress
        username
        avatar
      }
      expiresAt
      createdAt
    }
  }
`;

class BiddingService {
  async placeBid(wallet: WalletContextState, nftId: string, price: number, expirationDays: number): Promise<Bid> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    try {
      console.log(`Placing bid of ${price} SOL on NFT ${nftId} with expiration in ${expirationDays} days`);
      
      // Create a new mock bid
      const newBid: Bid = {
        id: `bid-${Date.now()}`,
        price: price,
        from: {
          id: 'current-user',
          walletAddress: wallet.publicKey.toString(),
          username: 'CurrentUser',
          avatar: 'https://i.pravatar.cc/150?img=4'
        },
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Add the new bid to the mock bids array
      MOCK_BIDS.push(newBid);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return newBid;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }
  
  async cancelBid(wallet: WalletContextState, bidId: string): Promise<any> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    try {
      console.log(`Cancelling bid ${bidId}`);
      
      // Find the bid index
      const bidIndex = MOCK_BIDS.findIndex(bid => bid.id === bidId);
      
      if (bidIndex === -1) {
        throw new Error('Bid not found');
      }
      
      // Check if the user is the bid creator
      const bid = MOCK_BIDS[bidIndex];
      if (bid.from.walletAddress !== wallet.publicKey?.toString()) {
        throw new Error('Only the bid creator can cancel this bid');
      }
      
      // Remove the bid from the mock bids array
      MOCK_BIDS.splice(bidIndex, 1);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { id: bidId, status: 'cancelled' };
    } catch (error) {
      console.error('Error canceling bid:', error);
      throw error;
    }
  }
  
  async acceptBid(wallet: WalletContextState, bidId: string): Promise<any> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    try {
      console.log(`Accepting bid ${bidId}`);
      
      // Find the bid
      const bid = MOCK_BIDS.find(b => b.id === bidId);
      
      if (!bid) {
        throw new Error('Bid not found');
      }
      
      // Simulate a transaction
      const mockSignature = generateMockSignature();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove the bid from the mock bids array
      const bidIndex = MOCK_BIDS.findIndex(b => b.id === bidId);
      if (bidIndex !== -1) {
        MOCK_BIDS.splice(bidIndex, 1);
      }
      
      return {
        id: bidId,
        type: 'bid_accepted',
        nft: {
          id: 'nft-1',
          owner: {
            id: bid.from.id,
            walletAddress: bid.from.walletAddress
          },
          listed: false
        },
        from: bid.from,
        to: {
          id: 'seller-id',
          walletAddress: wallet.publicKey.toString()
        },
        price: bid.price,
        signature: mockSignature,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  }
  
  async getBids(nftId: string): Promise<Bid[]> {
    try {
      console.log(`Getting bids for NFT ${nftId}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return the mock bids
      // In a real implementation, we would filter by nftId
      return [...MOCK_BIDS];
    } catch (error) {
      console.error('Error getting bids:', error);
      throw error;
    }
  }
}

export default new BiddingService();
