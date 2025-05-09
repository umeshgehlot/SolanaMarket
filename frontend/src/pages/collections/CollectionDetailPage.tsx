import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NFTGrid from '../../components/nft/NFTGrid';
import { NFT as NFTType } from '../../services/nftService';

// Mock collection data
const MOCK_COLLECTIONS = [
  {
    id: '1',
    name: 'Solana Monkeys',
    description: 'A collection of 10,000 unique monkey NFTs on the Solana blockchain.',
    image: 'https://via.placeholder.com/300',
    bannerImage: 'https://via.placeholder.com/1200x400',
    creator: {
      address: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'MonkeyCreator',
      avatar: 'https://via.placeholder.com/50',
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
    image: 'https://via.placeholder.com/300',
    bannerImage: 'https://via.placeholder.com/1200x400',
    creator: {
      address: '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'ApeCreator',
      avatar: 'https://via.placeholder.com/50',
    },
    floorPrice: 5.8,
    totalVolume: 45000,
    items: 5000,
    verified: true,
    createdAt: '2023-02-20T14:45:00Z',
  },
];

// Mock NFT data that conforms to the NFTType interface
const MOCK_NFTS: NFTType[] = [
  {
    id: '1',
    name: 'Solana Monkey #1234',
    description: 'A unique Solana Monkey NFT',
    image: 'https://via.placeholder.com/400',
    price: 2.5,
    collection: {
      id: '1',
      name: 'Solana Monkeys',
      image: 'https://via.placeholder.com/100',
    },
    creator: {
      id: 'creator1',
      walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'MonkeyCreator',
    },
    owner: {
      id: 'owner1',
      walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    },
    mintAddress: 'mint123456789',
    listed: true,
    createdAt: '2023-05-15T10:30:00Z',
  },
  {
    id: '5',
    name: 'Solana Monkey #5678',
    description: 'A unique Solana Monkey NFT',
    image: 'https://via.placeholder.com/400',
    price: 3.1,
    collection: {
      id: '1',
      name: 'Solana Monkeys',
      image: 'https://via.placeholder.com/100',
    },
    creator: {
      id: 'creator1',
      walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'MonkeyCreator',
    },
    owner: {
      id: 'owner2',
      walletAddress: '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    },
    mintAddress: 'mint567891234',
    listed: true,
    createdAt: '2023-05-18T11:30:00Z',
  },
  {
    id: '9',
    name: 'Solana Monkey #9012',
    description: 'A unique Solana Monkey NFT',
    image: 'https://via.placeholder.com/400',
    price: 2.8,
    collection: {
      id: '1',
      name: 'Solana Monkeys',
      image: 'https://via.placeholder.com/100',
    },
    creator: {
      id: 'creator1',
      walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'MonkeyCreator',
    },
    owner: {
      id: 'owner3',
      walletAddress: 'Axrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    },
    mintAddress: 'mint901234567',
    listed: true,
    createdAt: '2023-05-20T12:30:00Z',
  },
  {
    id: '2',
    name: 'Degenerate Ape #4567',
    description: 'A unique Degenerate Ape NFT',
    image: 'https://via.placeholder.com/400',
    price: 5.8,
    collection: {
      id: '2',
      name: 'Degenerate Apes',
      image: 'https://via.placeholder.com/100',
    },
    creator: {
      id: 'creator2',
      walletAddress: '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    },
    owner: {
      id: 'owner4',
      walletAddress: '7yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      username: 'ApeHolder',
    },
    mintAddress: 'mint456789012',
    listed: true,
    createdAt: '2023-06-20T14:45:00Z',
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

const CollectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [nfts, setNfts] = useState<NFTType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'activity'>('items');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('price-asc');
  const [listedOnly, setListedOnly] = useState(false);
  
  // Load collection and NFTs
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the API
        // const collectionData = await collectionsService.getCollection(id);
        // const nftsData = await nftService.getNFTsByCollection(id);
        
        // For now, use mock data
        const collectionData = MOCK_COLLECTIONS.find(c => c.id === id);
        if (!collectionData) {
          throw new Error('Collection not found');
        }
        
        // Filter NFTs by collection
        let collectionNfts = MOCK_NFTS.filter(nft => nft.collection?.name === collectionData.name);
        
        // Apply search filter
        if (searchQuery) {
          collectionNfts = collectionNfts.filter(nft => 
            nft.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Apply listed only filter
        if (listedOnly) {
          collectionNfts = collectionNfts.filter(nft => nft.listed);
        }
        
        // Apply sorting
        const [sortField, sortDirection] = sortOption.split('-');
        collectionNfts.sort((a, b) => {
          if (sortField === 'price') {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
          } else if (sortField === 'name') {
            return sortDirection === 'asc' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          } else { // date
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          }
        });
        
        setCollection(collectionData);
        setNfts(collectionNfts);
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load collection data');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCollectionData();
    }
  }, [id, searchQuery, sortOption, listedOnly]);
  
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }
  
  if (loading || !collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-dark-200 rounded-xl mb-8"></div>
          <div className="h-10 bg-dark-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-dark-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-dark-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-8 bg-dark-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 bg-dark-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Banner */}
      <div className="w-full h-64 bg-dark-200 overflow-hidden">
        <img
          src={collection.bannerImage}
          alt={`${collection.name} banner`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Collection Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative -mt-20 mb-4">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-md">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {collection.verified && (
                <div className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1 border-2 border-white" title="Verified Collection">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
            <p className="text-dark-600 mb-6">{collection.description}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {collection.creator.avatar ? (
                  <img
                    src={collection.creator.avatar}
                    alt={collection.creator.username || "Creator"}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-100 rounded-full mr-2"></div>
                )}
                <span className="text-sm">
                  Created by{' '}
                  <span className="font-medium">
                    {collection.creator.username || `${collection.creator.address.substring(0, 6)}...${collection.creator.address.substring(collection.creator.address.length - 4)}`}
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 lg:w-3/4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Floor Price</p>
                <p className="text-2xl font-bold flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                    <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {collection.floorPrice} SOL
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Total Volume</p>
                <p className="text-2xl font-bold flex items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                    <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {formatNumber(collection.totalVolume)} SOL
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Items</p>
                <p className="text-2xl font-bold">{formatNumber(collection.items)}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Owners</p>
                <p className="text-2xl font-bold">{formatNumber(Math.floor(collection.items * 0.7))}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary">
                Buy on Magic Eden
              </button>
              <button className="btn btn-outline">
                Share
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-dark-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'items'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                }`}
                onClick={() => setActiveTab('items')}
              >
                Items
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'items' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-dark-700 mb-1">
                    Search Items
                  </label>
                  <input
                    type="text"
                    id="search"
                    className="input"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="md:w-64">
                  <label htmlFor="sort" className="block text-sm font-medium text-dark-700 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    className="input"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="date-desc">Recently Added</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
                
                <div className="md:w-auto flex items-center">
                  <input
                    type="checkbox"
                    id="listedOnly"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-300 rounded"
                    checked={listedOnly}
                    onChange={(e) => setListedOnly(e.target.checked)}
                  />
                  <label htmlFor="listedOnly" className="ml-2 block text-sm text-dark-700">
                    Listed Items Only
                  </label>
                </div>
              </div>
            </div>
            
            {/* NFT Grid */}
            {nfts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-dark-600 mb-2">No Items Found</h3>
                <p className="text-dark-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <NFTGrid nfts={nfts} loading={false} />
            )}
          </>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-dark-200">
                  {/* Mock activity data */}
                  {[
                    { event: 'Sale', item: 'Solana Monkey #1234', price: 2.5, from: '8xrt45...iKnQK', to: '3xrt45...iKnQK', time: '2 hours ago' },
                    { event: 'List', item: 'Solana Monkey #5678', price: 3.1, from: '3xrt45...iKnQK', to: null, time: '5 hours ago' },
                    { event: 'Offer', item: 'Solana Monkey #9012', price: 2.2, from: 'Axrt45...iKnQK', to: null, time: '1 day ago' },
                    { event: 'Transfer', item: 'Solana Monkey #3456', price: null, from: '8xrt45...iKnQK', to: 'Bxrt45...iKnQK', time: '2 days ago' },
                    { event: 'Mint', item: 'Solana Monkey #7890', price: null, from: null, to: '8xrt45...iKnQK', time: '3 days ago' },
                  ].map((activity, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.event === 'Sale' ? 'bg-green-100 text-green-800' :
                          activity.event === 'List' ? 'bg-blue-100 text-blue-800' :
                          activity.event === 'Offer' ? 'bg-yellow-100 text-yellow-800' :
                          activity.event === 'Transfer' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.event}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">
                        {activity.item}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        {activity.price ? (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                              <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {activity.price} SOL
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        {activity.from || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        {activity.to || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        {activity.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailPage;
