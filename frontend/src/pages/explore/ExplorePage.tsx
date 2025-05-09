import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NFTGrid from '../../components/nft/NFTGrid';
import nftService, { NFT, NFTFilter, NFTSort } from '../../services/nftService';

// Mock collections for filter options
const MOCK_COLLECTIONS = [
  { id: '1', name: 'Solana Monkeys', image: 'https://robohash.org/collection1?set=set4&size=50x50' },
  { id: '2', name: 'Degenerate Apes', image: 'https://robohash.org/collection2?set=set4&size=50x50' },
  { id: '3', name: 'Solana Punks', image: 'https://robohash.org/collection3?set=set4&size=50x50' },
  { id: '4', name: 'Magic Eden Gems', image: 'https://robohash.org/collection4?set=set4&size=50x50' },
];

// Helper function to convert mock NFT data to the correct format
const createMockNFT = (id: string, name: string, image: string, price: number, collectionName: string, creatorAddress: string, creatorUsername: string, ownerAddress: string): NFT => {
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
      address: ownerAddress, // For backward compatibility
    },
    mintAddress: `Mint${id}${Date.now().toString().substring(0, 8)}`,
    listed: true,
    createdAt: new Date().toISOString(),
  };
};

// Mock NFT data
const MOCK_NFTS: NFT[] = [
  createMockNFT('1', 'Solana Monkey #1234', 'https://robohash.org/1?set=set4', 2.5, 'Solana Monkeys', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'MonkeyCreator', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('2', 'Degenerate Ape #4567', 'https://robohash.org/2?set=set4', 5.8, 'Degenerate Apes', '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', '', '7yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('3', 'Solana Punk #789', 'https://robohash.org/3?set=set4', 1.2, 'Solana Punks', '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', '', '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('4', 'Magic Eden Gem #321', 'https://robohash.org/4?set=set4', 3.7, 'Magic Eden Gems', '5xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'GemCreator', '4xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('5', 'Solana Monkey #5678', 'https://robohash.org/5?set=set4', 3.1, 'Solana Monkeys', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'MonkeyCreator', '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('6', 'Degenerate Ape #8901', 'https://robohash.org/6?set=set4', 6.2, 'Degenerate Apes', '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', '', '2yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('7', 'Solana Punk #1234', 'https://robohash.org/7?set=set4', 1.5, 'Solana Punks', '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', '', '1xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('8', 'Magic Eden Gem #654', 'https://robohash.org/8?set=set4', 4.0, 'Magic Eden Gems', '5xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'GemCreator', '0xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('9', 'Solana Monkey #9012', 'https://robohash.org/9?set=set4', 2.8, 'Solana Monkeys', '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'MonkeyCreator', 'Axrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('10', 'Degenerate Ape #2345', 'https://robohash.org/10?set=set4', 5.5, 'Degenerate Apes', '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', '', 'Byrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('11', 'Solana Punk #5678', 'https://robohash.org/11?set=set4', 1.8, 'Solana Punks', '6xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', '', 'Cxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
  createMockNFT('12', 'Magic Eden Gem #987', 'https://robohash.org/12?set=set4', 4.2, 'Magic Eden Gems', '5xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', 'GemCreator', 'Dxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK'),
];

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [listedOnly, setListedOnly] = useState(searchParams.get('listed') === 'true');
  const [sortField, setSortField] = useState<'PRICE' | 'CREATED_AT' | 'NAME'>(
    (searchParams.get('sortField') as any) || 'CREATED_AT'
  );
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>(
    (searchParams.get('sortDirection') as any) || 'DESC'
  );
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const itemsPerPage = 12;
  
  // Load NFTs
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build filter
        const filter: NFTFilter = {};
        if (searchQuery) filter.name = searchQuery;
        if (selectedCollection) filter.collection = selectedCollection;
        if (minPrice) filter.minPrice = parseFloat(minPrice);
        if (maxPrice) filter.maxPrice = parseFloat(maxPrice);
        if (listedOnly) filter.listed = true;
        
        // Build sort
        const sort: NFTSort = {
          field: sortField,
          direction: sortDirection,
        };
        
        // Calculate offset
        const offset = (currentPage - 1) * itemsPerPage;
        
        // In a real implementation, we would fetch from the API
        // const data = await nftService.getNFTs(itemsPerPage, offset, filter, sort);
        
        // For now, use mock data and apply filters manually
        let filteredNfts = [...MOCK_NFTS];
        
        // Apply filters
        if (searchQuery) {
          filteredNfts = filteredNfts.filter(nft => 
            nft.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (selectedCollection) {
          filteredNfts = filteredNfts.filter(nft => 
            nft.collectionName === MOCK_COLLECTIONS.find(c => c.id === selectedCollection)?.name
          );
        }
        
        if (minPrice) {
          filteredNfts = filteredNfts.filter(nft => 
            nft.price !== undefined && nft.price >= parseFloat(minPrice)
          );
        }
        
        if (maxPrice) {
          filteredNfts = filteredNfts.filter(nft => 
            nft.price !== undefined && nft.price <= parseFloat(maxPrice)
          );
        }
        
        if (listedOnly) {
          filteredNfts = filteredNfts.filter(nft => nft.listed);
        }
        
        // Apply sorting
        filteredNfts.sort((a, b) => {
          if (sortField === 'PRICE') {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return sortDirection === 'ASC' ? priceA - priceB : priceB - priceA;
          } else if (sortField === 'NAME') {
            return sortDirection === 'ASC' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          } else { // CREATED_AT
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortDirection === 'ASC' ? dateA - dateB : dateB - dateA;
          }
        });
        
        // Apply pagination
        filteredNfts = filteredNfts.slice(offset, offset + itemsPerPage);
        
        setNfts(filteredNfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Failed to load NFTs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTs();
  }, [
    searchQuery,
    selectedCollection,
    minPrice,
    maxPrice,
    listedOnly,
    sortField,
    sortDirection,
    currentPage,
  ]);
  
  // Update URL search params when filters change
  const updateSearchParams = () => {
    const params: Record<string, string> = {};
    
    if (searchQuery) params.search = searchQuery;
    if (selectedCollection) params.collection = selectedCollection;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (listedOnly) params.listed = 'true';
    if (sortField !== 'CREATED_AT') params.sortField = sortField;
    if (sortDirection !== 'DESC') params.sortDirection = sortDirection;
    if (currentPage > 1) params.page = currentPage.toString();
    
    setSearchParams(params);
  };
  
  // Handle filter changes
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    updateSearchParams();
  };
  
  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCollection(e.target.value);
    setCurrentPage(1);
    updateSearchParams();
  };
  
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };
  
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };
  
  const handleListedOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListedOnly(e.target.checked);
    updateSearchParams();
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split('-') as ['PRICE' | 'CREATED_AT' | 'NAME', 'ASC' | 'DESC'];
    setSortField(field);
    setSortDirection(direction);
    updateSearchParams();
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams();
  };
  
  // Handle NFT click
  const handleNFTClick = (nft: NFT) => {
    // In a real implementation, we would navigate to the NFT detail page
    console.log('NFT clicked:', nft);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Explore NFTs</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column - Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-dark-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className="input pr-10"
                    placeholder="Search NFTs..."
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
              </div>
              
              <div>
                <label htmlFor="collection" className="block text-sm font-medium text-dark-700 mb-1">
                  Collection
                </label>
                <div className="relative">
                  <select
                    id="collection"
                    className="input pl-10"
                    value={selectedCollection}
                    onChange={handleCollectionChange}
                    style={{ backgroundImage: 'none' }}
                  >
                    <option value="">All Collections</option>
                    {MOCK_COLLECTIONS.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  {selectedCollection ? (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img 
                        src={MOCK_COLLECTIONS.find(c => c.id === selectedCollection)?.image} 
                        alt="Collection" 
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  Price Range (SOL)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input"
                    min="0"
                    step="0.01"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input"
                    min="0"
                    step="0.01"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                  />
                </div>
                <button
                  type="button"
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  onClick={() => {
                    if (minPrice || maxPrice) {
                      setMinPrice('');
                      setMaxPrice('');
                      updateSearchParams();
                    }
                  }}
                >
                  Clear Price Filter
                </button>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="listedOnly"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-300 rounded"
                  checked={listedOnly}
                  onChange={handleListedOnlyChange}
                />
                <label htmlFor="listedOnly" className="ml-2 block text-sm text-dark-700">
                  Listed NFTs Only
                </label>
              </div>
              
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-dark-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort"
                  className="input"
                  value={`${sortField}-${sortDirection}`}
                  onChange={handleSortChange}
                >
                  <option value="CREATED_AT-DESC">Recently Added</option>
                  <option value="CREATED_AT-ASC">Oldest First</option>
                  <option value="PRICE-ASC">Price: Low to High</option>
                  <option value="PRICE-DESC">Price: High to Low</option>
                  <option value="NAME-ASC">Name: A to Z</option>
                  <option value="NAME-DESC">Name: Z to A</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>
        
        {/* Right column - NFT Grid */}
        <div className="lg:col-span-3">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          ) : (
            <>
              <NFTGrid
                nfts={nfts}
                loading={loading}
                onNFTClick={handleNFTClick}
              />
              
              {/* Pagination */}
              {!loading && nfts.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === 1
                          ? 'text-dark-400 cursor-not-allowed'
                          : 'text-dark-700 hover:bg-dark-100'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(5)].map((_, i) => {
                      const page = currentPage - 2 + i;
                      if (page < 1) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-dark-700 hover:bg-dark-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 py-2 rounded-md text-dark-700 hover:bg-dark-100"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
              
              {!loading && nfts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-dark-600 mb-2">No NFTs Found</h3>
                  <p className="text-dark-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
