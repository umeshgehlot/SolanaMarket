import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import nftService, { NFT as NFTType } from '../../services/nftService';
import MakeOfferModal from '../../components/nft/offers/MakeOfferModal';
import OffersTable, { Offer } from '../../components/nft/offers/OffersTable';
import MakeBidModal from '../../components/nft/bids/MakeBidModal';
import BidsTable, { Bid } from '../../components/nft/bids/BidsTable';
import biddingService from '../../services/biddingService';

// Mock NFT data for demonstration
const MOCK_NFT = {
  id: '1',
  name: 'Solana Monkey #1234',
  description: 'A unique Solana Monkey NFT from the popular collection. This rare piece features distinctive traits including golden fur, laser eyes, and a crown.',
  image: 'https://robohash.org/1?set=set4&size=800x800',
  price: 2.5,
  collectionName: 'Solana Monkeys',
  collectionImage: 'https://robohash.org/c1?set=set4&size=100x100',
  creator: {
    id: 'creator-1',
    walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'MonkeyCreator',
    avatar: 'https://robohash.org/creator1?set=set4&size=50x50',
    address: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', // For backward compatibility
  },
  owner: {
    id: 'owner-1',
    walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'MonkeyCreator',
    avatar: 'https://robohash.org/owner1?set=set4&size=50x50',
    address: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK', // For backward compatibility
  },
  attributes: [
    { trait_type: 'Background', value: 'Blue' },
    { trait_type: 'Fur', value: 'Golden' },
    { trait_type: 'Eyes', value: 'Laser' },
    { trait_type: 'Mouth', value: 'Grin' },
    { trait_type: 'Headwear', value: 'Crown' },
    { trait_type: 'Clothing', value: 'Suit' },
  ],
  listed: true,
  mintAddress: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
  tokenAddress: '7yrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
  royaltyPercentage: 5,
  createdAt: '2023-05-15T10:30:00Z',
  history: [
    {
      type: 'MINT',
      from: null,
      to: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      price: null,
      timestamp: '2023-05-15T10:30:00Z',
    },
    {
      type: 'LIST',
      from: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
      to: null,
      price: 2.5,
      timestamp: '2023-05-16T14:45:00Z',
    },
  ],
};

// Helper function to create similar NFTs with proper structure
const createSimilarNFT = (id: string, name: string, price: number): NFTType => ({
  id,
  name,
  image: `https://robohash.org/${id}?set=set4&size=400x400`,
  price,
  collectionName: 'Solana Monkeys',
  collectionImage: `https://robohash.org/c${id}?set=set4&size=100x100`,
  creator: {
    id: `creator-${id}`,
    walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'MonkeyCreator',
    address: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
  },
  owner: {
    id: `owner-${id}`,
    walletAddress: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
    username: 'MonkeyCreator',
    address: '8xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
  },
  mintAddress: `Mint${id}${Date.now().toString().substring(0, 8)}`,
  listed: true,
  createdAt: new Date().toISOString(),
});

// Mock similar NFTs
const SIMILAR_NFTS = [
  createSimilarNFT('2', 'Solana Monkey #4567', 3.2),
  createSimilarNFT('3', 'Solana Monkey #7890', 2.8),
  createSimilarNFT('4', 'Solana Monkey #1111', 4.5),
];

const NFTDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'offers' | 'bids'>('details');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingBids, setLoadingBids] = useState(false);
  const [nft, setNft] = useState<NFTType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // We'll define isOwner later after we have the NFT data

  // Fetch NFT data
  useEffect(() => {
    const fetchNFTData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch the NFT data from the API
        // const nftData = await nftService.getNFT(id);
        
        // For now, use mock data
        setNft(MOCK_NFT as unknown as NFTType);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError('Failed to load NFT data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTData();
  }, [id]);
  
  // Fetch offers when the offers tab is selected
  useEffect(() => {
    const fetchOffers = async () => {
      if (!id || activeTab !== 'offers') return;
      
      try {
        setLoadingOffers(true);
        
        // In a real implementation, we would fetch offers from the API
        // const offersData = await nftService.getOffers(id);
        
        // For now, use mock data
        const mockOffers: Offer[] = [
          {
            id: '1',
            price: 2.2,
            from: {
              id: 'user1',
              walletAddress: '3xrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
              username: 'NFTCollector',
              avatar: 'https://via.placeholder.com/50',
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            price: 2.0,
            from: {
              id: 'user2',
              walletAddress: 'Axrt45JYBs3ChKzn3Qna4fTE18SRbCZDJGPmkE5iKnQK',
              username: 'SolanaFan',
            },
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        setOffers(mockOffers);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoadingOffers(false);
      }
    };
    
    fetchOffers();
  }, [id, activeTab]);
  
  // Fetch bids when the bids tab is selected
  useEffect(() => {
    const fetchBids = async () => {
      if (!id || activeTab !== 'bids') return;
      
      try {
        setLoadingBids(true);
        
        // Fetch bids from the mock bidding service
        const bidsData = await biddingService.getBids(id);
        setBids(bidsData);
        
        console.log('Loaded bids:', bidsData);
      } catch (error) {
        console.error('Error fetching bids:', error);
      } finally {
        setLoadingBids(false);
      }
    };
    
    fetchBids();
  }, [id, activeTab]);
  
  // Define isOwner based on wallet connection and NFT ownership
  const isOwner = nft && publicKey && nft.owner.walletAddress === publicKey.toString();
  
  const handleBuy = async () => {
    if (!nft || !connected || !publicKey) return;
    
    try {
      // In a real implementation, we would call the NFT service to buy the NFT
      // await nftService.buyNFT(wallet, nft.id);
      
      console.log('Buying NFT:', nft.id);
      alert('Purchase successful!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error buying NFT:', err);
      alert('Error buying NFT: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleMakeOffer = () => {
    setIsOfferModalOpen(true);
  };
  
  const handleMakeBid = () => {
    setIsBidModalOpen(true);
  };
  
  const handleSubmitOffer = async (price: number, expirationDays: number) => {
    if (!nft || !connected || !publicKey) return;
    
    try {
      // In a real implementation, we would call the NFT service to make an offer
      // await nftService.makeOffer(wallet, nft.id, price, expirationDays);
      
      console.log('Making offer for NFT:', nft.id, 'Amount:', price, 'Expiration:', expirationDays, 'days');
      
      // Add the new offer to the offers list
      const newOffer: Offer = {
        id: Date.now().toString(), // Mock ID
        price,
        from: {
          id: 'current-user',
          walletAddress: publicKey.toString(),
          username: 'You',
        },
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      setOffers([newOffer, ...offers]);
      setActiveTab('offers'); // Switch to offers tab
      alert('Offer submitted successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error making offer:', err);
      alert('Error making offer: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleSubmitBid = async (price: number, expirationDays: number) => {
    if (!nft || !connected || !publicKey) return;
    
    try {
      // Call the bidding service to place a bid
      const newBid = await biddingService.placeBid(wallet, nft.id, price, expirationDays);
      
      console.log('Placing bid for NFT:', nft.id, 'Amount:', price, 'Expiration:', expirationDays, 'days');
      
      setBids([newBid, ...bids]);
      setActiveTab('bids'); // Switch to bids tab
      alert('Bid placed successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Error placing bid: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleCancelListing = async () => {
    if (!nft || !connected || !publicKey) return;
    
    try {
      // In a real implementation, we would call the NFT service to cancel the listing
      // await nftService.unlistNFT(wallet, nft.id);
      
      console.log('Cancelling listing for NFT:', nft.id);
      alert('Listing cancelled successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error cancelling listing:', err);
      alert('Error cancelling listing: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleAcceptOffer = async (offerId: string) => {
    if (!nft || !connected || !publicKey) return;
    
    try {
      // In a real implementation, we would call the NFT service to accept the offer
      // await nftService.acceptOffer(wallet, offerId);
      
      console.log('Accepting offer:', offerId);
      
      // Remove the accepted offer from the offers list
      setOffers(offers.filter(offer => offer.id !== offerId));
      alert('Offer accepted successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error accepting offer:', err);
      alert('Error accepting offer: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleCancelOffer = async (offerId: string) => {
    if (!connected || !publicKey) return;
    
    try {
      // In a real implementation, we would call the NFT service to cancel the offer
      // await nftService.cancelOffer(wallet, offerId);
      
      console.log('Cancelling offer:', offerId);
      
      // Remove the cancelled offer from the offers list
      setOffers(offers.filter(offer => offer.id !== offerId));
      alert('Offer cancelled successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error cancelling offer:', err);
      alert('Error cancelling offer: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleAcceptBid = async (bidId: string) => {
    if (!nft || !connected || !publicKey || !isOwner) return;
    
    try {
      // Call the bidding service to accept the bid
      const transaction = await biddingService.acceptBid(wallet, bidId);
      
      console.log('Accepting bid:', bidId);
      
      // Update the bids list
      const updatedBids = bids.filter(bid => bid.id !== bidId);
      setBids(updatedBids);
      
      // Update the NFT ownership
      if (transaction && transaction.nft) {
        // Refresh NFT data
        const updatedNft = await nftService.getNFT(nft.id);
        setNft(updatedNft);
      }
      
      alert('Bid accepted successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error accepting bid:', err);
      alert('Error accepting bid: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleCancelBid = async (bidId: string) => {
    if (!connected || !publicKey) return;
    
    try {
      // Call the bidding service to cancel the bid
      await biddingService.cancelBid(wallet, bidId);
      
      console.log('Cancelling bid:', bidId);
      
      // Update the bids list
      const updatedBids = bids.filter(bid => bid.id !== bidId);
      setBids(updatedBids);
      
      alert('Bid cancelled successfully!'); // Replace with proper notification in a real app
    } catch (err) {
      console.error('Error cancelling bid:', err);
      alert('Error cancelling bid: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const formatAddress = (address?: string) => {
    if (!address) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  if (loading || !nft) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-dark-200 rounded-xl h-96"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-10 bg-dark-200 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-dark-200 rounded w-1/3 mb-6"></div>
              <div className="bg-dark-200 rounded-xl h-32 mb-6"></div>
              <div className="bg-dark-200 rounded-xl h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Offer Modal */}
      <MakeOfferModal 
        nft={nft}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleSubmitOffer}
      />
      
      {/* Bid Modal */}
      <MakeBidModal 
        nft={nft}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handleSubmitBid}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column - NFT Image */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Collection info */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center">
                {nft.collectionImage ? (
                  <img
                    src={nft.collectionImage}
                    alt={nft.collectionName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full mr-3"></div>
                )}
                <div>
                  <p className="text-sm text-dark-500">Collection</p>
                  <Link to={`/collection/${nft.collectionName}`} className="font-semibold text-primary-600 hover:text-primary-700">
                    {nft.collectionName}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - NFT Details */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
          
          {/* Owner and Creator info */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <p className="text-sm text-dark-500">Owner</p>
              <div className="flex items-center">
                {nft.owner.avatar ? (
                  <img
                    src={nft.owner.avatar}
                    alt={nft.owner.username || formatAddress(nft.owner.address)}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-100 rounded-full mr-2"></div>
                )}
                <span className="font-medium">
                  {nft.owner.username || formatAddress(nft.owner.address)}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-dark-500">Creator</p>
              <div className="flex items-center">
                {nft.creator.avatar ? (
                  <img
                    src={nft.creator.avatar}
                    alt={nft.creator.username || formatAddress(nft.creator.address)}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-100 rounded-full mr-2"></div>
                )}
                <span className="font-medium">
                  {nft.creator.username || formatAddress(nft.creator.address)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Price and Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-dark-500">Current Price</p>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-dark-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                    <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-2xl font-bold">{nft.price} SOL</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-dark-500">Royalty</p>
                <p className="font-medium">{nft.royaltyPercentage}%</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {nft.listed && !isOwner && (
                <button
                  onClick={handleBuy}
                  className="btn btn-primary flex-1 py-3"
                >
                  Buy Now
                </button>
              )}
              
              {!isOwner && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleMakeBid}
                    className="btn btn-primary flex-1 py-3"
                  >
                    Place Bid
                  </button>
                  <button
                    onClick={handleMakeOffer}
                    className="btn btn-secondary flex-1 py-3"
                  >
                    Make Offer
                  </button>
                </div>
              )}
              
              {isOwner && nft.listed && (
                <button
                  onClick={handleCancelListing}
                  className="btn btn-outline flex-1 py-3"
                >
                  Cancel Listing
                </button>
              )}
              
              {isOwner && !nft.listed && (
                <button
                  className="btn btn-primary flex-1 py-3"
                >
                  List for Sale
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-dark-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'details'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'history'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'offers'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                  }`}
                  onClick={() => setActiveTab('offers')}
                >
                  Offers
                </button>
                <button
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'bids'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300'
                  }`}
                  onClick={() => setActiveTab('bids')}
                >
                  Bids
                </button>
              </nav>
            </div>
            
            <div className="py-6">
              {activeTab === 'details' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-dark-600">{nft.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Attributes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {nft.attributes?.map((attr, index) => (
                        <div key={index} className="bg-dark-50 rounded-lg p-3">
                          <p className="text-xs text-dark-500 uppercase">{attr.trait_type}</p>
                          <p className="font-medium">{attr.value}</p>
                        </div>
                      )) || <div className="text-dark-500">No attributes found</div>}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                  <div className="space-y-4">
                    {nft.history?.map((event, index) => (
                      <div key={index} className="border-b border-dark-100 pb-4 last:border-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{event.type}</p>
                            <div className="flex items-center text-sm text-dark-500">
                              {event.from && (
                                <span>From: {formatAddress(event.from)}</span>
                              )}
                              {event.to && (
                                <span>To: {formatAddress(event.to)}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {event.price && (
                              <p className="font-medium">{event.price} SOL</p>
                            )}
                            <p className="text-sm text-dark-500">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'offers' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Offers</h3>
                  <OffersTable 
                    nft={nft}
                    offers={offers}
                    loading={loadingOffers}
                    isOwner={isOwner}
                    onAcceptOffer={handleAcceptOffer}
                    onCancelOffer={handleCancelOffer}
                  />
                </div>
              )}
              
              {activeTab === 'bids' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bids</h3>
                  <BidsTable 
                    nft={nft}
                    bids={bids}
                    loading={loadingBids}
                    isOwner={isOwner}
                    onAcceptBid={handleAcceptBid}
                    onCancelBid={handleCancelBid}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar NFTs */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">More from this collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SIMILAR_NFTS.map((similarNft) => (
            <Link key={similarNft.id} to={`/nft/${similarNft.id}`} className="card card-hover">
              <div className="aspect-square rounded-lg overflow-hidden mb-3">
                <img
                  src={similarNft.image}
                  alt={similarNft.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <h3 className="font-semibold">{similarNft.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-dark-500">{similarNft.collectionName}</span>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1 text-dark-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                      <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">{similarNft.price} SOL</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTDetailPage;
