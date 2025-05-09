import { gql } from '@apollo/client';
import apolloClient from './apolloClient';

// GraphQL queries
const GET_COLLECTIONS = gql`
  query GetCollections($limit: Int, $offset: Int, $filter: CollectionFilterInput, $sort: CollectionSortInput) {
    collections(limit: $limit, offset: $offset, filter: $filter, sort: $sort) {
      id
      name
      description
      image
      bannerImage
      creator {
        id
        walletAddress
        username
        avatar
      }
      floorPrice
      volume
      verified
      createdAt
      updatedAt
    }
  }
`;

const GET_COLLECTION = gql`
  query GetCollection($id: ID!) {
    collection(id: $id) {
      id
      name
      description
      image
      bannerImage
      creator {
        id
        walletAddress
        username
        avatar
      }
      nfts {
        id
        name
        image
        price
        listed
      }
      floorPrice
      volume
      verified
      createdAt
      updatedAt
    }
  }
`;

// Types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  creator: {
    id: string;
    walletAddress: string;
    username?: string;
    avatar?: string;
  };
  nfts?: Array<{
    id: string;
    name: string;
    image: string;
    price?: number;
    listed: boolean;
  }>;
  floorPrice?: number;
  volume?: number;
  verified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionFilter {
  name?: string;
  creator?: string;
  verified?: boolean;
}

export interface CollectionSort {
  field: 'VOLUME' | 'FLOOR_PRICE' | 'CREATED_AT' | 'NAME';
  direction: 'ASC' | 'DESC';
}

export interface CreateCollectionParams {
  name: string;
  description?: string;
  image?: File;
  bannerImage?: File;
}

// Collection Service
class CollectionService {
  // Fetch collections with optional filtering and sorting
  async getCollections(
    limit: number = 20,
    offset: number = 0,
    filter?: CollectionFilter,
    sort?: CollectionSort
  ): Promise<Collection[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COLLECTIONS,
        variables: { limit, offset, filter, sort },
        fetchPolicy: 'network-only', // Don't use the cache
      });
      
      return data.collections;
    } catch (error) {
      console.error('Error fetching collections:', error);
      
      // Fallback to mock data for development
      return this.getMockCollections();
    }
  }

  // Fetch a single collection by ID
  async getCollection(id: string): Promise<Collection> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COLLECTION,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      
      return data.collection;
    } catch (error) {
      console.error(`Error fetching collection ${id}:`, error);
      
      // Fallback to mock data for development
      const mockCollections = this.getMockCollections();
      const collection = mockCollections.find(c => c.id === id);
      
      if (!collection) {
        throw new Error(`Collection with ID ${id} not found`);
      }
      
      return collection;
    }
  }

  // Create a new collection
  async createCollection(collectionData: CreateCollectionParams): Promise<Collection> {
    // This would normally send a mutation to the GraphQL API
    // For now, just log and return a mock response
    console.log('Creating collection:', collectionData);
    
    return {
      id: Math.random().toString(36).substring(2, 11),
      name: collectionData.name,
      description: collectionData.description || '',
      image: 'https://robohash.org/newcollection?set=set4&size=300x300',
      creator: {
        id: 'user-1',
        walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
        username: 'Current User',
        avatar: 'https://robohash.org/user1?set=set4&size=50x50',
      },
      floorPrice: 0,
      volume: 0,
      verified: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Mock data for development
  private getMockCollections(): Collection[] {
    return [
      {
        id: '1',
        name: 'Solana Monkeys',
        description: 'A collection of 10,000 unique monkey NFTs on the Solana blockchain.',
        image: 'https://robohash.org/collection1?set=set4&size=300x300',
        bannerImage: 'https://robohash.org/banner1?set=set4&size=1200x400',
        creator: {
          id: 'creator-1',
          walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
          username: 'MonkeyCreator',
          avatar: 'https://robohash.org/creator1?set=set4&size=50x50',
        },
        floorPrice: 2.5,
        volume: 12500,
        verified: true,
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-05-20T14:45:00Z',
      },
      {
        id: '2',
        name: 'Degenerate Apes',
        description: 'A collection of 5,000 unique ape NFTs on the Solana blockchain.',
        image: 'https://robohash.org/collection2?set=set4&size=300x300',
        bannerImage: 'https://robohash.org/banner2?set=set4&size=1200x400',
        creator: {
          id: 'creator-2',
          walletAddress: '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
          username: 'ApeCreator',
          avatar: 'https://robohash.org/creator2?set=set4&size=50x50',
        },
        floorPrice: 5.8,
        volume: 45000,
        verified: true,
        createdAt: '2023-02-10T08:15:00Z',
        updatedAt: '2023-05-18T11:30:00Z',
      },
      {
        id: '3',
        name: 'Solana Punks',
        description: 'A collection of 8,888 unique punk NFTs on the Solana blockchain.',
        image: 'https://robohash.org/collection3?set=set4&size=300x300',
        bannerImage: 'https://robohash.org/banner3?set=set4&size=1200x400',
        creator: {
          id: 'creator-3',
          walletAddress: 'Axrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
          username: 'PunkCreator',
          avatar: 'https://robohash.org/creator3?set=set4&size=50x50',
        },
        floorPrice: 1.2,
        volume: 8900,
        verified: true,
        createdAt: '2023-03-05T16:45:00Z',
        updatedAt: '2023-05-15T09:20:00Z',
      },
      {
        id: '4',
        name: 'Magic Eden Gems',
        description: 'A collection of 3,333 unique gem NFTs on the Solana blockchain.',
        image: 'https://robohash.org/collection4?set=set4&size=300x300',
        bannerImage: 'https://robohash.org/banner4?set=set4&size=1200x400',
        creator: {
          id: 'creator-4',
          walletAddress: 'Bxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
          username: 'GemCreator',
          avatar: 'https://robohash.org/creator4?set=set4&size=50x50',
        },
        floorPrice: 3.7,
        volume: 22000,
        verified: true,
        createdAt: '2023-04-12T12:00:00Z',
        updatedAt: '2023-05-10T17:30:00Z',
      },
      {
        id: '5',
        name: 'Crypto Kitties',
        description: 'A collection of 15,000 unique kitty NFTs on the Solana blockchain.',
        image: 'https://robohash.org/collection5?set=set4&size=300x300',
        bannerImage: 'https://robohash.org/banner5?set=set4&size=1200x400',
        creator: {
          id: 'creator-5',
          walletAddress: 'Cxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
          username: 'KittyCreator',
          avatar: 'https://robohash.org/creator5?set=set4&size=50x50',
        },
        floorPrice: 0.9,
        volume: 7500,
        verified: false,
        createdAt: '2023-05-01T09:45:00Z',
        updatedAt: '2023-05-05T14:15:00Z',
      },
    ];
  }
}

export default new CollectionService();
