import { gql } from '@apollo/client';
import apolloClient from './apolloClient';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  Metaplex, 
  walletAdapterIdentity,
  StorageDriver,
  toMetaplexFile,
  NftWithToken,
  Nft,
  CreateNftInput
} from '@metaplex-foundation/js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Offer } from '../components/nft/offers/OffersTable';

// GraphQL queries
const GET_NFTS = gql`
  query GetNFTs($limit: Int, $offset: Int, $filter: NFTFilterInput, $sort: NFTSortInput) {
    nfts(limit: $limit, offset: $offset, filter: $filter, sort: $sort) {
      id
      name
      description
      image
      collection {
        id
        name
        image
      }
      creator {
        id
        walletAddress
        username
        avatar
      }
      owner {
        id
        walletAddress
        username
        avatar
      }
      price
      royaltyPercentage
      mintAddress
      tokenAddress
      listed
      createdAt
      updatedAt
    }
  }
`;

const GET_NFT = gql`
  query GetNFT($id: ID!) {
    nft(id: $id) {
      id
      name
      description
      image
      collection {
        id
        name
        image
      }
      creator {
        id
        walletAddress
        username
        avatar
      }
      owner {
        id
        walletAddress
        username
        avatar
      }
      price
      royaltyPercentage
      mintAddress
      tokenAddress
      metadata
      listed
      createdAt
      updatedAt
    }
  }
`;

const LIST_NFT = gql`
  mutation ListNFT($id: ID!, $price: Float!) {
    listNFT(id: $id, price: $price) {
      id
      price
      listed
      updatedAt
    }
  }
`;

const UNLIST_NFT = gql`
  mutation UnlistNFT($id: ID!) {
    unlistNFT(id: $id) {
      id
      listed
      updatedAt
    }
  }
`;

const BUY_NFT = gql`
  mutation BuyNFT($id: ID!) {
    buyNFT(id: $id) {
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

const MAKE_OFFER = gql`
  mutation MakeOffer($nftId: ID!, $price: Float!, $expirationDays: Int!) {
    makeOffer(nftId: $nftId, price: $price, expirationDays: $expirationDays) {
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

const CANCEL_OFFER = gql`
  mutation CancelOffer($id: ID!) {
    cancelOffer(id: $id) {
      id
      status
    }
  }
`;

const ACCEPT_OFFER = gql`
  mutation AcceptOffer($id: ID!) {
    acceptOffer(id: $id) {
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

const GET_OFFERS = gql`
  query GetOffers($nftId: ID!) {
    offers(nftId: $nftId) {
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

// Types
export interface NFT {
  id: string;
  name: string;
  description?: string;
  image: string;
  collection?: {
    id: string;
    name: string;
    image?: string;
  };
  // For backward compatibility with mock data
  collectionName?: string;
  collectionImage?: string;
  creator: {
    id: string;
    walletAddress: string;
    username?: string;
    avatar?: string;
    address?: string; // For backward compatibility with mock data
  };
  owner: {
    id: string;
    walletAddress: string;
    username?: string;
    avatar?: string;
    address?: string; // For backward compatibility with mock data
  };
  price?: number;
  royaltyPercentage?: number;
  royalty?: number; // For backward compatibility
  mintAddress: string;
  tokenAddress?: string;
  metadata?: any;
  attributes?: Array<{ trait_type: string; value: string }>;
  history?: Array<any>;
  listed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NFTFilter {
  name?: string;
  collection?: string;
  creator?: string;
  owner?: string;
  minPrice?: number;
  maxPrice?: number;
  listed?: boolean;
}

export interface NFTSort {
  field: 'PRICE' | 'CREATED_AT' | 'NAME';
  direction: 'ASC' | 'DESC';
}

export interface CreateNFTParams {
  name: string;
  description: string;
  image: File;
  collectionId?: string;
  royalty?: number;
  attributes?: Array<{ trait_type: string; value: string }>;
}

// NFT Service
class NFTService {
  private connection: Connection;
  private endpoint: string;
  
  constructor(endpoint: string = process.env.REACT_APP_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com') {
    this.endpoint = endpoint;
    this.connection = new Connection(endpoint);
  }
  
  // Fetch NFTs with optional filtering and sorting
  async getNFTs(
    limit: number = 20,
    offset: number = 0,
    filter?: NFTFilter,
    sort?: NFTSort
  ): Promise<NFT[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_NFTS,
        variables: { limit, offset, filter, sort },
        fetchPolicy: 'network-only',
      });
      
      return data.nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw error;
    }
  }
  
  // Fetch a single NFT by ID
  async getNFT(id: string): Promise<NFT> {
    try {
      const { data } = await apolloClient.query({
        query: GET_NFT,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      
      return data.nft;
    } catch (error) {
      console.error(`Error fetching NFT with ID ${id}:`, error);
      throw error;
    }
  }
  
  private convertMetaplexNFT(nft: any): NFT {
    // Handle both NftWithToken and Nft types
    const tokenAddress = 'token' in nft ? nft.token.address.toString() : '';
    
    return {
      id: nft.address.toString(),
      name: nft.name,
      description: nft.json?.description || '',
      image: nft.json?.image || '',
      price: 0, // Not set yet as it's not listed
      owner: {
        id: nft.ownership?.owner.toString() || '',
        walletAddress: nft.ownership?.owner.toString() || '',
        username: '',
      },
      creator: {
        id: nft.creators?.[0]?.address.toString() || '',
        walletAddress: nft.creators?.[0]?.address.toString() || '',
        username: '',
      },
      collection: nft.collection ? {
        id: nft.collection.address.toString(),
        name: nft.collection.name || '',
        image: '',
      } : undefined,
      mintAddress: nft.address.toString(),
      tokenAddress: tokenAddress,
      listed: false,
      royaltyPercentage: nft.sellerFeeBasisPoints / 100, // Convert basis points to percentage
      createdAt: new Date().toISOString(),
    };
  }
  
  // Create a new NFT
  async createNFT(wallet: WalletContextState, nftData: CreateNFTParams): Promise<any> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com');
      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet));
      
      // Upload the image
      // Convert File to buffer for Metaplex
      const buffer = await nftData.image.arrayBuffer();
      const imageFile = toMetaplexFile(buffer, nftData.image.name);
      const imageUri = await metaplex.storage().upload(imageFile);
      
      // Create metadata
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: nftData.name,
        description: nftData.description,
        image: imageUri,
        attributes: nftData.attributes,
        collection: nftData.collectionId ? { name: nftData.collectionId } : undefined,
      });
      
      // Create NFT
      const { nft } = await metaplex.nfts().create({
        uri,
        name: nftData.name,
        sellerFeeBasisPoints: nftData.royalty ? nftData.royalty * 100 : 0, // Convert percentage to basis points
        maxSupply: 1, // NFT (Non-Fungible)
      });
      
      return this.convertMetaplexNFT(nft);
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
  }
  
  // List an NFT for sale
  async listNFT(id: string, price: number): Promise<NFT> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LIST_NFT,
        variables: { id, price },
      });
      
      return data.listNFT;
    } catch (error) {
      console.error(`Error listing NFT with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Unlist an NFT
  async unlistNFT(id: string): Promise<NFT> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UNLIST_NFT,
        variables: { id },
      });
      
      return data.unlistNFT;
    } catch (error) {
      console.error(`Error unlisting NFT with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Buy an NFT
  async buyNFT(id: string): Promise<any> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: BUY_NFT,
        variables: { id },
      });
      
      return data.buyNFT;
    } catch (error) {
      console.error(`Error buying NFT with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Get NFT metadata from Solana
  async getNFTByMint(mintAddress: string): Promise<any> {
    try {
      const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com');
      const metaplex = Metaplex.make(connection);
      
      const mintPublicKey = new PublicKey(mintAddress);
      
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
      return nft;
    } catch (error) {
      console.error(`Error fetching NFT metadata for mint address ${mintAddress}:`, error);
      throw error;
    }
  }
  
  // Magic Eden integration - fetch NFT listings from Magic Eden
  async getMagicEdenListings(collectionSymbol: string, limit: number = 20): Promise<any[]> {
    try {
      // This would be implemented with Magic Eden's API
      // For now, we'll return a mock response
      return [];
    } catch (error) {
      console.error(`Error fetching Magic Eden listings for collection ${collectionSymbol}:`, error);
      throw error;
    }
  }
}

export default new NFTService();
