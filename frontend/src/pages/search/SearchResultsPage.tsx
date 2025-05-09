import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SearchBar from '../../components/search/SearchBar';
import NFTGrid from '../../components/nft/NFTGrid';
import { NFT as NFTType } from '../../services/nftService';

// Mock NFT data
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
      id: 'owner1',
      walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    },
    mintAddress: 'mint567891234',
    listed: false,
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
];

// Mock collections data
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

// Mock users data
const MOCK_USERS = [
  {
    id: 'user1',
    walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'SolanaWhale',
    avatar: 'https://via.placeholder.com/150',
    bio: 'NFT collector and trader on Solana. Always looking for the next big project.',
    joinedAt: '2023-01-15T10:30:00Z',
  },
  {
    id: 'user2',
    walletAddress: '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'NFTCollector',
    avatar: 'https://via.placeholder.com/150',
    bio: 'Building the future of digital art on Solana.',
    joinedAt: '2023-02-20T14:45:00Z',
  },
];

type SearchCategory = 'all' | 'nfts' | 'collections' | 'users';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [nfts, setNfts] = useState<NFTType[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Search function
  useEffect(() => {
    if (!searchQuery) return;
    
    const performSearch = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would call the API
        // const results = await searchService.search(searchQuery, activeCategory);
        
        // For now, use mock data and filter based on the query
        const filteredNfts = MOCK_NFTS.filter(nft => 
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.collection?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const filteredCollections = MOCK_COLLECTIONS.filter(collection => 
          collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const filteredUsers = MOCK_USERS.filter(user => 
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setNfts(filteredNfts);
        setCollections(filteredCollections);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error performing search:', error);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [searchQuery, activeCategory]);
  
  // Get total results count
  const totalResults = nfts.length + collections.length + users.length;
  
  // Filter results based on active category
  const filteredNfts = activeCategory === 'all' || activeCategory === 'nfts' ? nfts : [];
  const filteredCollections = activeCategory === 'all' || activeCategory === 'collections' ? collections : [];
  const filteredUsers = activeCategory === 'all' || activeCategory === 'users' ? users : [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <SearchBar className="max-w-3xl" />
      </div>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-dark-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 bg-dark-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-dark-600 mb-4">
              Found {totalResults} results for "{searchQuery}"
            </p>
            
            <div className="flex border-b border-dark-200">
              {(['all', 'nfts', 'collections', 'users'] as const).map((category) => (
                <button
                  key={category}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeCategory === category
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'all' ? 'All' : 
                   category === 'nfts' ? `NFTs (${nfts.length})` : 
                   category === 'collections' ? `Collections (${collections.length})` : 
                   `Users (${users.length})`}
                </button>
              ))}
            </div>
          </div>
          
          {totalResults === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <svg className="w-16 h-16 mx-auto text-dark-300 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-xl font-semibold text-dark-600 mb-2">No Results Found</h3>
              <p className="text-dark-500 mb-6">
                We couldn't find any matches for "{searchQuery}".
              </p>
              <p className="text-dark-500 mb-6">
                Try checking your spelling or using more general terms.
              </p>
              <Link to="/explore" className="btn btn-primary">
                Explore NFTs
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Collections */}
              {filteredCollections.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Collections</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredCollections.map((collection) => (
                      <Link 
                        key={collection.id} 
                        to={`/collection/${collection.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="h-32 bg-dark-200 overflow-hidden">
                          <img 
                            src={collection.bannerImage} 
                            alt={collection.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center mb-2">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm mr-3">
                              <img 
                                src={collection.image} 
                                alt={collection.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">{collection.name}</h3>
                              <p className="text-sm text-dark-500">
                                {collection.items.toLocaleString()} items
                              </p>
                            </div>
                            {collection.verified && (
                              <div className="ml-auto bg-primary-600 text-white rounded-full p-1" title="Verified Collection">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-dark-600 text-sm line-clamp-2 mb-3">
                            {collection.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-dark-500">Floor Price</p>
                              <p className="font-semibold flex items-center">
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                                  <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {collection.floorPrice} SOL
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-dark-500">Volume</p>
                              <p className="font-semibold flex items-center justify-end">
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                                  <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {collection.totalVolume.toLocaleString()} SOL
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Users */}
              {filteredUsers.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Users</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => (
                      <Link 
                        key={user.id} 
                        to={`/profile/${user.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4"
                      >
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.username} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.username}</h3>
                            <p className="text-sm text-dark-500">
                              {formatAddress(user.walletAddress)}
                            </p>
                          </div>
                        </div>
                        {user.bio && (
                          <p className="text-dark-600 text-sm line-clamp-3 mb-3">
                            {user.bio}
                          </p>
                        )}
                        <p className="text-xs text-dark-500">
                          Joined {new Date(user.joinedAt).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* NFTs */}
              {filteredNfts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">NFTs</h2>
                  <NFTGrid nfts={filteredNfts} loading={false} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
