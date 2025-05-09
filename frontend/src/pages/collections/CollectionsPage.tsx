import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock collections data
const MOCK_COLLECTIONS = [
  {
    id: '1',
    name: 'Solana Monkeys',
    description: 'A collection of 10,000 unique monkey NFTs on the Solana blockchain.',
    image: 'https://robohash.org/collection1?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner1?set=set4&size=1200x400',
    creator: {
      address: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'MonkeyCreator',
      avatar: 'https://robohash.org/creator1?set=set4&size=50x50',
    },
    floorPrice: 2.5,
    totalVolume: 12500,
    items: 10000,
    verified: true,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Degenerate Apes',
    description: 'A collection of 5,000 degenerate ape NFTs living on the Solana blockchain.',
    image: 'https://robohash.org/collection2?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner2?set=set4&size=1200x400',
    creator: {
      address: '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'ApeCreator',
      avatar: 'https://robohash.org/creator2?set=set4&size=50x50',
    },
    floorPrice: 5.8,
    totalVolume: 45000,
    items: 5000,
    verified: true,
    createdAt: '2023-02-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Solana Punks',
    description: 'A collection of 8,888 pixelated punk NFTs on Solana.',
    image: 'https://robohash.org/collection3?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner3?set=set4&size=1200x400',
    creator: {
      address: '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'PunkCreator',
      avatar: 'https://robohash.org/creator3?set=set4&size=50x50',
    },
    floorPrice: 1.2,
    totalVolume: 8900,
    items: 8888,
    verified: true,
    createdAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Magic Eden Gems',
    description: 'A collection of 3,333 rare gem NFTs exclusively on Magic Eden and our marketplace.',
    image: 'https://robohash.org/collection4?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner4?set=set4&size=1200x400',
    creator: {
      address: '5xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'GemCreator',
      avatar: 'https://robohash.org/creator4?set=set4&size=50x50',
    },
    floorPrice: 3.7,
    totalVolume: 22000,
    items: 3333,
    verified: true,
    createdAt: '2023-04-05T16:20:00Z',
  },
  {
    id: '5',
    name: 'Solana Kitties',
    description: 'A collection of 7,777 adorable cat NFTs on Solana.',
    image: 'https://robohash.org/collection5?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner5?set=set4&size=1200x400',
    creator: {
      address: '4xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'KittyCreator',
      avatar: 'https://robohash.org/creator5?set=set4&size=50x50',
    },
    floorPrice: 1.8,
    totalVolume: 9500,
    items: 7777,
    verified: false,
    createdAt: '2023-05-12T11:30:00Z',
  },
  {
    id: '6',
    name: 'Pixel Warriors',
    description: 'A collection of 6,000 pixelated warrior NFTs battling on the Solana blockchain.',
    image: 'https://robohash.org/collection6?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner6?set=set4&size=1200x400',
    creator: {
      address: '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'WarriorCreator',
      avatar: 'https://robohash.org/creator6?set=set4&size=50x50',
    },
    floorPrice: 2.2,
    totalVolume: 15000,
    items: 6000,
    verified: true,
    createdAt: '2023-06-25T15:45:00Z',
  },
  {
    id: '7',
    name: 'Solana Dragons',
    description: 'A collection of 4,444 dragon NFTs with unique traits and abilities.',
    image: 'https://robohash.org/collection7?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner7?set=set4&size=1200x400',
    creator: {
      address: '2xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'DragonCreator',
      avatar: 'https://robohash.org/creator7?set=set4&size=50x50',
    },
    floorPrice: 4.5,
    totalVolume: 28000,
    items: 4444,
    verified: true,
    createdAt: '2023-07-15T10:15:00Z',
  },
  {
    id: '8',
    name: 'Cosmic Aliens',
    description: 'A collection of 5,555 alien NFTs from across the cosmos.',
    image: 'https://robohash.org/collection8?set=set4&size=300x300',
    bannerImage: 'https://robohash.org/banner8?set=set4&size=1200x400',
    creator: {
      address: '1xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'AlienCreator',
      avatar: 'https://robohash.org/creator8?set=set4&size=50x50',
    },
    floorPrice: 1.5,
    totalVolume: 11000,
    items: 5555,
    verified: false,
    createdAt: '2023-08-10T17:20:00Z',
  },
];

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  bannerImage: string;
  creator: {
    address: string;
    username?: string;
    avatar?: string;
  };
  floorPrice: number;
  totalVolume: number;
  items: number;
  verified: boolean;
  createdAt: string;
}

enum SortOption {
  VOLUME_DESC = 'VOLUME_DESC',
  VOLUME_ASC = 'VOLUME_ASC',
  FLOOR_DESC = 'FLOOR_DESC',
  FLOOR_ASC = 'FLOOR_ASC',
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.VOLUME_DESC);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  // Load collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the API
        // const data = await collectionsService.getCollections();
        
        // For now, use mock data
        let filteredCollections = [...MOCK_COLLECTIONS];
        
        // Apply filters
        if (searchQuery) {
          filteredCollections = filteredCollections.filter(collection => 
            collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            collection.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (verifiedOnly) {
          filteredCollections = filteredCollections.filter(collection => collection.verified);
        }
        
        // Apply sorting
        filteredCollections.sort((a, b) => {
          switch (sortOption) {
            case SortOption.VOLUME_DESC:
              return b.totalVolume - a.totalVolume;
            case SortOption.VOLUME_ASC:
              return a.totalVolume - b.totalVolume;
            case SortOption.FLOOR_DESC:
              return b.floorPrice - a.floorPrice;
            case SortOption.FLOOR_ASC:
              return a.floorPrice - b.floorPrice;
            case SortOption.NEWEST:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case SortOption.OLDEST:
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            default:
              return 0;
          }
        });
        
        setCollections(filteredCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setError('Failed to load collections. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, [searchQuery, sortOption, verifiedOnly]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already applied via the useEffect dependency
  };
  
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">NFT Collections</h1>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch}>
              <label htmlFor="search" className="block text-sm font-medium text-dark-700 mb-1">
                Search Collections
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="input pr-10"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          <div className="md:w-64">
            <label htmlFor="sort" className="block text-sm font-medium text-dark-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              className="input"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value={SortOption.VOLUME_DESC}>Volume: High to Low</option>
              <option value={SortOption.VOLUME_ASC}>Volume: Low to High</option>
              <option value={SortOption.FLOOR_DESC}>Floor Price: High to Low</option>
              <option value={SortOption.FLOOR_ASC}>Floor Price: Low to High</option>
              <option value={SortOption.NEWEST}>Newest First</option>
              <option value={SortOption.OLDEST}>Oldest First</option>
            </select>
          </div>
          
          <div className="md:w-auto flex items-center">
            <input
              type="checkbox"
              id="verifiedOnly"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-300 rounded"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            <label htmlFor="verifiedOnly" className="ml-2 block text-sm text-dark-700">
              Verified Collections Only
            </label>
          </div>
        </div>
      </div>
      
      {/* Collections Grid */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-40 bg-dark-200"></div>
              <div className="p-4">
                <div className="h-6 bg-dark-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-dark-200 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-dark-200 rounded"></div>
                  <div className="h-10 bg-dark-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-dark-600 mb-2">No Collections Found</h3>
          <p className="text-dark-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collection/${collection.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-40 bg-dark-100 relative">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
                {collection.verified && (
                  <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1" title="Verified Collection">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{collection.name}</h3>
                <p className="text-dark-500 text-sm mb-4 line-clamp-2">{collection.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-dark-500">Floor Price</p>
                    <p className="font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                        <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {collection.floorPrice} SOL
                    </p>
                  </div>
                  <div>
                    <p className="text-dark-500">Volume</p>
                    <p className="font-medium">{formatNumber(collection.totalVolume)} SOL</p>
                  </div>
                  <div>
                    <p className="text-dark-500">Items</p>
                    <p className="font-medium">{formatNumber(collection.items)}</p>
                  </div>
                  <div>
                    <p className="text-dark-500">Creator</p>
                    <p className="font-medium truncate" title={collection.creator.username || collection.creator.address}>
                      {collection.creator.username || `${collection.creator.address.substring(0, 4)}...${collection.creator.address.substring(collection.creator.address.length - 4)}`}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
