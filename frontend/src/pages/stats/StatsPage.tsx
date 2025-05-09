import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock data for stats
const MOCK_STATS = {
  totalVolume: 1250000,
  dailyVolume: 45000,
  weeklyVolume: 320000,
  totalNFTs: 25000,
  totalCollections: 120,
  totalUsers: 8500,
  averagePrice: 12.5,
  floorPrice: 2.3,
};

// Mock data for top collections
const MOCK_TOP_COLLECTIONS = [
  {
    id: '1',
    name: 'Solana Monkeys',
    image: 'https://robohash.org/collection1?set=set4&size=100x100',
    floorPrice: 2.5,
    volume24h: 12500,
    volumeChange: 15.2,
    items: 10000,
    owners: 3500,
  },
  {
    id: '2',
    name: 'Degenerate Apes',
    image: 'https://robohash.org/collection2?set=set4&size=100x100',
    floorPrice: 5.8,
    volume24h: 8900,
    volumeChange: -5.3,
    items: 5000,
    owners: 2100,
  },
  {
    id: '3',
    name: 'Solana Punks',
    image: 'https://robohash.org/collection3?set=set4&size=100x100',
    floorPrice: 3.2,
    volume24h: 7500,
    volumeChange: 8.7,
    items: 8000,
    owners: 2800,
  },
  {
    id: '4',
    name: 'Pixel Warriors',
    image: 'https://robohash.org/collection4?set=set4&size=100x100',
    floorPrice: 1.8,
    volume24h: 5200,
    volumeChange: 22.5,
    items: 12000,
    owners: 4200,
  },
  {
    id: '5',
    name: 'Crypto Kitties',
    image: 'https://robohash.org/collection5?set=set4&size=100x100',
    floorPrice: 0.9,
    volume24h: 3800,
    volumeChange: -2.1,
    items: 15000,
    owners: 5100,
  },
];

// Mock data for recent sales
const MOCK_RECENT_SALES = [
  {
    id: '1',
    name: 'Solana Monkey #1234',
    image: 'https://robohash.org/nft1?set=set4&size=100x100',
    collection: {
      name: 'Solana Monkeys',
      image: 'https://robohash.org/collection1?set=set4&size=50x50',
    },
    price: 2.5,
    from: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    to: '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    time: '2 hours ago',
  },
  {
    id: '2',
    name: 'Degenerate Ape #4567',
    image: 'https://robohash.org/nft2?set=set4&size=100x100',
    collection: {
      name: 'Degenerate Apes',
      image: 'https://robohash.org/collection2?set=set4&size=50x50',
    },
    price: 5.8,
    from: '9xzt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    to: '7yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    time: '3 hours ago',
  },
  {
    id: '3',
    name: 'Solana Punk #7890',
    image: 'https://robohash.org/nft3?set=set4&size=100x100',
    collection: {
      name: 'Solana Punks',
      image: 'https://robohash.org/collection3?set=set4&size=50x50',
    },
    price: 3.2,
    from: 'Axrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    to: 'Bxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    time: '5 hours ago',
  },
  {
    id: '4',
    name: 'Pixel Warrior #2345',
    image: 'https://robohash.org/nft4?set=set4&size=100x100',
    collection: {
      name: 'Pixel Warriors',
      image: 'https://robohash.org/collection4?set=set4&size=50x50',
    },
    price: 1.8,
    from: 'Cxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    to: 'Dxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    time: '8 hours ago',
  },
  {
    id: '5',
    name: 'Crypto Kitty #6789',
    image: 'https://robohash.org/nft5?set=set4&size=100x100',
    collection: {
      name: 'Crypto Kitties',
      image: 'https://robohash.org/collection5?set=set4&size=50x50',
    },
    price: 0.9,
    from: 'Exrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    to: 'Fxrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    time: '12 hours ago',
  },
];

// Mock data for price history (for chart)
const MOCK_PRICE_HISTORY = [
  { date: '2023-05-01', volume: 32000 },
  { date: '2023-05-02', volume: 35000 },
  { date: '2023-05-03', volume: 30000 },
  { date: '2023-05-04', volume: 40000 },
  { date: '2023-05-05', volume: 38000 },
  { date: '2023-05-06', volume: 42000 },
  { date: '2023-05-07', volume: 45000 },
  { date: '2023-05-08', volume: 50000 },
  { date: '2023-05-09', volume: 48000 },
  { date: '2023-05-10', volume: 52000 },
  { date: '2023-05-11', volume: 55000 },
  { date: '2023-05-12', volume: 58000 },
  { date: '2023-05-13', volume: 60000 },
  { date: '2023-05-14', volume: 62000 },
];

const StatsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [loading, setLoading] = useState(true);
  
  // Format numbers with commas and abbreviate large numbers
  const formatNumber = (num: number, abbreviate: boolean = false) => {
    if (abbreviate) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
    return num.toLocaleString();
  };
  
  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-dark-200 rounded w-1/4 mb-8"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 bg-dark-200 rounded-lg"></div>
            ))}
          </div>
          
          <div className="h-8 bg-dark-200 rounded w-1/5 mb-4"></div>
          <div className="h-80 bg-dark-200 rounded-lg mb-12"></div>
          
          <div className="h-8 bg-dark-200 rounded w-1/5 mb-4"></div>
          <div className="bg-dark-200 rounded-lg mb-12">
            <div className="h-12 w-full"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 w-full mt-2"></div>
            ))}
          </div>
          
          <div className="h-8 bg-dark-200 rounded w-1/5 mb-4"></div>
          <div className="bg-dark-200 rounded-lg">
            <div className="h-12 w-full"></div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 w-full mt-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Marketplace Statistics</h1>
      
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
              <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-dark-500 text-sm">Total Volume</p>
          </div>
          <p className="text-2xl font-bold">{formatNumber(MOCK_STATS.totalVolume, true)} SOL</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-dark-500 text-sm">Total NFTs</p>
          </div>
          <p className="text-2xl font-bold">{formatNumber(MOCK_STATS.totalNFTs, true)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-dark-500 text-sm">Collections</p>
          </div>
          <p className="text-2xl font-bold">{formatNumber(MOCK_STATS.totalCollections)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 20H7C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V16C21 18.2091 19.2091 20 17 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 14C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 4L21 8L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 4L3 8L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-dark-500 text-sm">Users</p>
          </div>
          <p className="text-2xl font-bold">{formatNumber(MOCK_STATS.totalUsers, true)}</p>
        </div>
      </div>
      
      {/* Volume Chart */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trading Volume</h2>
          
          <div className="flex bg-dark-100 rounded-lg p-1">
            {(['24h', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === range
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-dark-500 hover:text-dark-700'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range === '24h' ? '24H' : range === '7d' ? '7D' : range === '30d' ? '30D' : 'All'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          {/* This would be replaced with a real chart component */}
          <div className="relative h-64">
            <div className="absolute bottom-0 left-0 w-full h-px bg-dark-200"></div>
            <div className="absolute left-0 top-0 h-full w-px bg-dark-200"></div>
            
            <div className="flex h-full items-end">
              {MOCK_PRICE_HISTORY.map((day, index) => {
                const height = (day.volume / 62000) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary-100 rounded-t-sm relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-dark-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mb-1">
                        {formatNumber(day.volume)} SOL
                      </div>
                    </div>
                    {index % 2 === 0 && (
                      <div className="text-xs text-dark-500 mt-2 transform -rotate-45 origin-top-left">
                        {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Collections */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Top Collections</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-200">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Collection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Floor Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Volume (24h)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Owners</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {MOCK_TOP_COLLECTIONS.map((collection, index) => (
                  <tr key={collection.id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/collection/${collection.id}`} className="flex items-center">
                        <span className="text-dark-500 mr-4">{index + 1}</span>
                        <img 
                          src={collection.image} 
                          alt={collection.name} 
                          className="w-10 h-10 rounded-lg mr-3"
                        />
                        <span className="font-medium">{collection.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-dark-900">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                          <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {collection.floorPrice} SOL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-dark-900">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                          <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {formatNumber(collection.volume24h)} SOL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center ${
                        collection.volumeChange >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {collection.volumeChange >= 0 ? (
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {Math.abs(collection.volumeChange)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                      {formatNumber(collection.items)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                      {formatNumber(collection.owners)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-dark-200">
            <Link to="/collections" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All Collections →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Sales */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-200">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {MOCK_RECENT_SALES.map((sale) => (
                  <tr key={sale.id} className="hover:bg-dark-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/nft/${sale.id}`} className="flex items-center">
                        <img 
                          src={sale.image} 
                          alt={sale.name} 
                          className="w-10 h-10 rounded-lg mr-3"
                        />
                        <div>
                          <div className="font-medium">{sale.name}</div>
                          <div className="flex items-center text-sm text-dark-500">
                            <img 
                              src={sale.collection.image} 
                              alt={sale.collection.name} 
                              className="w-4 h-4 rounded-full mr-1"
                            />
                            {sale.collection.name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-dark-900">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                          <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {sale.price} SOL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                      <Link to={`/profile/${sale.from}`} className="hover:text-primary-600">
                        {formatAddress(sale.from)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                      <Link to={`/profile/${sale.to}`} className="hover:text-primary-600">
                        {formatAddress(sale.to)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                      {sale.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-dark-200">
            <Link to="/explore" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All Transactions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
