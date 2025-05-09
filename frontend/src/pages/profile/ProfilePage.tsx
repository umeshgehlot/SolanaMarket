import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import NFTGrid from '../../components/nft/NFTGrid';
import { NFT as NFTType } from '../../services/nftService';

// Mock user data
const MOCK_USERS = [
  {
    id: 'self',
    walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'SolanaWhale',
    avatar: 'https://via.placeholder.com/150',
    bio: 'NFT collector and trader on Solana. Always looking for the next big project.',
    banner: 'https://via.placeholder.com/1200x400',
    twitter: 'solanawhale',
    website: 'https://solanawhale.io',
    joinedAt: '2023-01-15T10:30:00Z',
  },
  {
    id: 'user1',
    walletAddress: '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'NFTCollector',
    avatar: 'https://via.placeholder.com/150',
    bio: 'Building the future of digital art on Solana.',
    banner: 'https://via.placeholder.com/1200x400',
    twitter: 'nftcollector',
    website: 'https://nftcollector.io',
    joinedAt: '2023-02-20T14:45:00Z',
  },
];

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

interface User {
  id: string;
  walletAddress: string;
  username?: string;
  avatar?: string;
  bio?: string;
  banner?: string;
  twitter?: string;
  website?: string;
  joinedAt: string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const wallet = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [nfts, setNfts] = useState<NFTType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'collected' | 'created' | 'activity' | 'listed'>('collected');
  
  // Determine if viewing own profile
  const isOwnProfile = !id || id === 'self' || (wallet.connected && wallet.publicKey?.toString() === user?.walletAddress);
  
  // Load user and NFTs
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the API
        // const userData = await userService.getUser(id || wallet.publicKey?.toString());
        // const nftsData = await nftService.getNFTsByOwner(userData.walletAddress);
        
        // For now, use mock data
        let userData: User;
        if (!id || id === 'self') {
          // If no ID or 'self', use the connected wallet or the first mock user
          const foundUser = wallet.connected 
            ? MOCK_USERS.find(u => u.walletAddress === wallet.publicKey?.toString()) || MOCK_USERS[0]
            : MOCK_USERS[0];
          userData = foundUser;
        } else {
          // Otherwise find by ID
          const foundUser = MOCK_USERS.find(u => u.id === id);
          if (!foundUser) {
            throw new Error('User not found');
          }
          userData = foundUser;
        }
        
        // Filter NFTs based on active tab
        let userNfts: NFTType[] = [];
        if (activeTab === 'collected') {
          userNfts = MOCK_NFTS.filter(nft => nft.owner.walletAddress === userData.walletAddress);
        } else if (activeTab === 'created') {
          userNfts = MOCK_NFTS.filter(nft => nft.creator.walletAddress === userData.walletAddress);
        } else if (activeTab === 'listed') {
          userNfts = MOCK_NFTS.filter(nft => 
            nft.owner.walletAddress === userData.walletAddress && nft.listed
          );
        }
        
        setUser(userData);
        setNfts(userNfts);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id, wallet.connected, wallet.publicKey, activeTab]);
  
  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
  
  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-dark-200 rounded-xl mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="relative -mt-20 mb-4">
                <div className="w-32 h-32 rounded-full bg-dark-200"></div>
              </div>
              <div className="h-10 bg-dark-200 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-dark-200 rounded w-3/4 mb-6"></div>
              <div className="flex gap-4 mb-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-10 w-10 bg-dark-200 rounded-full"></div>
                ))}
              </div>
            </div>
            <div className="md:w-2/3 lg:w-3/4">
              <div className="h-8 bg-dark-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 bg-dark-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Banner */}
      <div className="w-full h-64 bg-dark-200 overflow-hidden">
        {user.banner ? (
          <img
            src={user.banner}
            alt={`${user.username || formatAddress(user.walletAddress)} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-700"></div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative -mt-20 mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username || formatAddress(user.walletAddress)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold">
                    {(user.username || formatAddress(user.walletAddress)).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-1">
              {user.username || formatAddress(user.walletAddress)}
            </h1>
            <p className="text-dark-500 mb-4 flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </p>
            
            {user.bio && (
              <p className="text-dark-700 mb-6">{user.bio}</p>
            )}
            
            <div className="flex gap-4 mb-6">
              <button className="btn btn-primary">
                {isOwnProfile ? 'Edit Profile' : 'Follow'}
              </button>
              
              <button className="btn btn-outline">
                Share
              </button>
            </div>
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center text-dark-500">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{formatAddress(user.walletAddress)}</span>
              </div>
              
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-dark-500 hover:text-primary-600">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>@{user.twitter}</span>
                </a>
              )}
              
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-dark-500 hover:text-primary-600">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33397 21.9434 7.02299C21.932 5.71201 21.4061 4.45794 20.4791 3.5309C19.5521 2.60386 18.298 2.07802 16.987 2.06663C15.676 2.05523 14.413 2.55921 13.47 3.46997L11.75 5.17997" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11C13.5705 10.4259 13.0226 9.95082 12.3935 9.60706C11.7643 9.2633 11.0685 9.05889 10.3534 9.00768C9.63821 8.95646 8.92041 9.05964 8.24866 9.31023C7.5769 9.56082 6.96689 9.95294 6.46 10.46L3.46 13.46C2.54921 14.403 2.04524 15.666 2.05663 16.977C2.06802 18.288 2.59387 19.5421 3.52091 20.4691C4.44795 21.3961 5.70201 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{user.website.replace(/(^\w+:|^)\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3 lg:w-3/4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Items</p>
                <p className="text-2xl font-bold">{nfts.length}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Collections</p>
                <p className="text-2xl font-bold">
                  {new Set(nfts.map(nft => nft.collection?.id)).size}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Following</p>
                <p className="text-2xl font-bold">125</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-dark-500 text-sm">Followers</p>
                <p className="text-2xl font-bold">1.2K</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-dark-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === 'collected'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                    }`}
                    onClick={() => setActiveTab('collected')}
                  >
                    Collected
                  </button>
                  <button
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === 'created'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                    }`}
                    onClick={() => setActiveTab('created')}
                  >
                    Created
                  </button>
                  <button
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === 'listed'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                    }`}
                    onClick={() => setActiveTab('listed')}
                  >
                    Listed
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
            
            {/* Tab Content */}
            {activeTab !== 'activity' ? (
              nfts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <svg className="w-16 h-16 mx-auto text-dark-300 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-dark-600 mb-2">No Items Found</h3>
                  <p className="text-dark-500 mb-6">
                    {activeTab === 'collected' && "This user hasn't collected any NFTs yet."}
                    {activeTab === 'created' && "This user hasn't created any NFTs yet."}
                    {activeTab === 'listed' && "This user doesn't have any NFTs listed for sale."}
                  </p>
                  {isOwnProfile && (
                    <Link to="/explore" className="btn btn-primary">
                      {activeTab === 'collected' && "Explore NFTs"}
                      {activeTab === 'created' && "Create NFT"}
                      {activeTab === 'listed' && "List an NFT"}
                    </Link>
                  )}
                </div>
              ) : (
                <NFTGrid nfts={nfts} loading={false} />
              )
            ) : (
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
                        { event: 'Sale', item: 'Solana Monkey #1234', price: 2.5, from: formatAddress(user.walletAddress), to: '3xrt45...iKnQK', time: '2 hours ago' },
                        { event: 'List', item: 'Solana Monkey #5678', price: 3.1, from: formatAddress(user.walletAddress), to: null, time: '5 hours ago' },
                        { event: 'Mint', item: 'Solana Monkey #9012', price: null, from: null, to: formatAddress(user.walletAddress), time: '1 day ago' },
                        { event: 'Offer', item: 'Degenerate Ape #4567', price: 5.2, from: 'Axrt45...iKnQK', to: formatAddress(user.walletAddress), time: '2 days ago' },
                        { event: 'Transfer', item: 'Solana Monkey #3456', price: null, from: '8xrt45...iKnQK', to: formatAddress(user.walletAddress), time: '3 days ago' },
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
      </div>
    </div>
  );
};

export default ProfilePage;
