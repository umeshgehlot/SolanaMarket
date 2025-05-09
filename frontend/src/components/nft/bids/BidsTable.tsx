import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT } from '../../../services/nftService';

export interface Bid {
  id: string;
  price: number;
  from: {
    id: string;
    walletAddress: string;
    username?: string;
    avatar?: string;
  };
  expiresAt: string;
  createdAt: string;
}

interface BidsTableProps {
  nft: NFT;
  bids: Bid[];
  loading: boolean;
  isOwner: boolean | null | undefined;
  onAcceptBid: (bidId: string) => void;
  onCancelBid: (bidId: string) => void;
}

const BidsTable: React.FC<BidsTableProps> = ({ 
  nft, 
  bids, 
  loading, 
  isOwner, 
  onAcceptBid, 
  onCancelBid 
}) => {
  const { publicKey } = useWallet();
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const isUserBid = (bid: Bid) => {
    return publicKey && publicKey.toString() === bid.from.walletAddress;
  };
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-3"></div>
        <div className="h-12 bg-gray-200 rounded mb-3"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bids yet</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bidder
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expiration
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bids.map((bid) => (
            <tr key={bid.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {bid.from.avatar ? (
                    <img 
                      src={bid.from.avatar} 
                      alt={bid.from.username || formatAddress(bid.from.walletAddress)} 
                      className="w-8 h-8 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-xs text-primary-800">
                        {(bid.from.username || bid.from.walletAddress).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {isUserBid(bid) ? 'You' : (bid.from.username || formatAddress(bid.from.walletAddress))}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                    <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">{bid.price} SOL</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(bid.expiresAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(bid.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {isOwner && !isUserBid(bid) && (
                  <button
                    onClick={() => onAcceptBid(bid.id)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Accept
                  </button>
                )}
                {isUserBid(bid) && (
                  <button
                    onClick={() => onCancelBid(bid.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BidsTable;
