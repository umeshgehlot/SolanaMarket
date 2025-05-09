import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NFTGrid from '../../components/nft/NFTGrid';
import { NFT } from '../../services/nftService';
import collectionService, { Collection } from '../../services/collectionService';

// Initial empty state for collections
const INITIAL_COLLECTIONS: Collection[] = [];

// Helper function to create properly structured NFTs
const createHomeNFT = (id: string, name: string, image: string, price: number, collectionName: string, creatorAddress: string, creatorUsername: string | undefined, ownerAddress: string, ownerUsername: string | undefined, listed: boolean, createdAt: string): NFT => {
  return {
    id,
    name,
    image,
    price,
    collectionName,
    collectionImage: `https://robohash.org/c${id}?set=set4&size=100x100`,
    creator: {
      id: `creator-${id}`,
      walletAddress: creatorAddress,
      username: creatorUsername,
      address: creatorAddress, // For backward compatibility
    },
    owner: {
      id: `owner-${id}`,
      walletAddress: ownerAddress,
      username: ownerUsername,
      address: ownerAddress, // For backward compatibility
    },
    mintAddress: `Mint${id}${Date.now().toString().substring(0, 8)}`,
    listed,
    createdAt,
  };
};

// Mock NFT data
const MOCK_NFTS: NFT[] = [
  createHomeNFT('1', 'Solana Monkey #1234', 'https://robohash.org/1?set=set4', 2.5, 'Solana Monkeys', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'MonkeyCreator', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, true, '2023-05-15T10:30:00Z'),
  createHomeNFT('2', 'Degenerate Ape #4567', 'https://robohash.org/2?set=set4', 5.8, 'Degenerate Apes', '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, '7yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'ApeHolder', true, '2023-06-20T14:45:00Z'),
  createHomeNFT('3', 'Solana Punk #789', 'https://robohash.org/3?set=set4', 1.2, 'Solana Punks', '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, false, '2023-04-10T09:15:00Z'),
  createHomeNFT('4', 'Magic Eden Gem #321', 'https://robohash.org/4?set=set4', 3.7, 'Magic Eden Gems', '5xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'GemCreator', '4xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, true, '2023-07-05T16:20:00Z'),
  createHomeNFT('5', 'Solana Monkey #5678', 'https://robohash.org/5?set=set4', 3.1, 'Solana Monkeys', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'MonkeyCreator', '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, true, '2023-05-18T11:30:00Z'),
  createHomeNFT('6', 'Degenerate Ape #8901', 'https://robohash.org/6?set=set4', 6.2, 'Degenerate Apes', '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, '2yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, true, '2023-06-25T15:45:00Z'),
  createHomeNFT('7', 'Solana Punk #1234', 'https://robohash.org/7?set=set4', 1.5, 'Solana Punks', '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, '1xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'PunkCollector', false, '2023-04-15T10:15:00Z'),
  createHomeNFT('8', 'Magic Eden Gem #654', 'https://robohash.org/8?set=set4', 4.0, 'Magic Eden Gems', '5xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'GemCreator', '0xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', undefined, true, '2023-07-10T17:20:00Z'),
];

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'art' | 'collectibles'>('trending');
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collections when component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const collections = await collectionService.getCollections(4, 0, { verified: true });
        setFeaturedCollections(collections);
        setError(null);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover, Collect, and Sell Extraordinary NFTs
              </h1>
              <p className="text-lg mb-8 text-white/80">
                The premier marketplace for NFTs on Solana. Buy, sell, and discover rare digital items.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/explore" className="btn bg-white text-primary-600 hover:bg-white/90">
                  Explore
                </Link>
                <Link to="/create" className="btn bg-transparent border border-white text-white hover:bg-white/10">
                  Create
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-white/10 rounded-lg transform rotate-6"></div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-white/10 rounded-lg transform -rotate-6"></div>
                <div className="relative z-10 bg-dark-800/50 backdrop-blur-sm p-4 rounded-xl">
                  <img
                    src="https://robohash.org/featured?set=set4&size=500x500"
                    alt="Featured NFT"
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="mt-4 p-4 bg-dark-900/70 backdrop-blur-sm rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Featured NFT</h3>
                        <p className="text-sm text-white/70">Solana Monkeys #1234</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/70">Current Price</p>
                        <p className="font-semibold">2.5 SOL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-lg bg-dark-50">
              <p className="text-3xl font-bold text-primary-600">5K+</p>
              <p className="text-dark-500">Daily Transactions</p>
            </div>
            <div className="p-6 rounded-lg bg-dark-50">
              <p className="text-3xl font-bold text-primary-600">100K+</p>
              <p className="text-dark-500">NFTs</p>
            </div>
            <div className="p-6 rounded-lg bg-dark-50">
              <p className="text-3xl font-bold text-primary-600">50K+</p>
              <p className="text-dark-500">Users</p>
            </div>
            <div className="p-6 rounded-lg bg-dark-50">
              <p className="text-3xl font-bold text-primary-600">1M+</p>
              <p className="text-dark-500">Total Volume</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Collections</h2>
            <Link to="/collections" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          <div className="mb-16">
            {/* Removed redundant h2 "Featured Collections" here */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
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
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : featuredCollections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-dark-500 text-lg">No featured collections available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCollections.map((collection) => (
                  <Link key={collection.id} to={`/collections/${collection.id}`} className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="h-40 bg-dark-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={collection.image || `https://robohash.org/${collection.id}?set=set4&bgset=bg2&size=300x300`}
                        alt={collection.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://robohash.org/error-${collection.id}?set=set4&bgset=bg1&size=300x300`; // Fallback on error
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 truncate" title={collection.name}>{collection.name}</h3>
                      <div className="grid grid-cols-3 gap-x-2 text-sm"> {/* Using grid-cols-3 for better spacing if values are long */}
                        <div>
                          <p className="text-dark-500">Floor</p>
                          <p className="font-medium truncate">{collection.floorPrice?.toFixed(2) ?? 'N/A'} SOL</p>
                        </div>
                        <div>
                          <p className="text-dark-500">Volume</p>
                          <p className="font-medium truncate">{(collection.volume ?? 0).toLocaleString(undefined, {maximumFractionDigits: 1})} SOL</p>
                        </div>
                        <div>
                          <p className="text-dark-500">Items</p>
                          <p className="font-medium truncate">{'N/A'}</p> {/* Display N/A for items */}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending NFTs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Trending NFTs</h2>
            <Link to="/explore" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          
          <NFTGrid nfts={MOCK_NFTS} loading={loading} />
        </div>
      </section>

      {/* Magic Eden Integration */}
      <section className="py-16 bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Magic Eden Integration</h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Seamlessly connect with Magic Eden, the largest NFT marketplace on Solana.
              Cross-list your NFTs, access a wider audience, and maximize your sales potential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cross-Listing</h3>
              <p className="text-white/70">
                List your NFTs on both our marketplace and Magic Eden with a single click.
                Reach more potential buyers without extra effort.
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Market Analytics</h3>
              <p className="text-white/70">
                Get comprehensive analytics from both platforms. Track your performance,
                monitor trends, and make data-driven decisions.
              </p>
            </div>
            
            <div className="bg-dark-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Unified Royalties</h3>
              <p className="text-white/70">
                Manage your creator royalties in one place. Ensure you get paid
                fairly for your creations, regardless of where they're sold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your NFT Journey?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Join thousands of creators and collectors on the fastest-growing NFT marketplace on Solana.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore" className="btn bg-white text-primary-600 hover:bg-white/90">
              Explore NFTs
            </Link>
            <Link to="/create" className="btn bg-transparent border border-white text-white hover:bg-white/10">
              Create NFT
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
