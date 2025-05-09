import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT as NFTType } from '../../../services/nftService';

export interface Offer {
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

interface OffersTableProps {
  nft: NFTType;
  offers: Offer[];
  loading?: boolean;
  isOwner: boolean | null | undefined;
  onAcceptOffer?: (offerId: string) => Promise<void>;
  onCancelOffer?: (offerId: string) => Promise<void>;
}

const OffersTable: React.FC<OffersTableProps> = ({
  nft,
  offers,
  loading = false,
  isOwner,
  onAcceptOffer,
  onCancelOffer
}) => {
  const { publicKey } = useWallet();
  
  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Calculate time remaining until expiration
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = Math.abs(expiration.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    }
    return `${diffHours}h`;
  };
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-dark-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 bg-dark-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (offers.length === 0) {
    return (
      <div className="text-center py-6 bg-white rounded-lg shadow-sm">
        <p className="text-dark-500">No offers yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-200">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Expires In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-dark-200">
            {offers.map((offer) => {
              const isUserOffer = publicKey?.toString() === offer.from.walletAddress;
              
              return (
                <tr key={offer.id} className="hover:bg-dark-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center font-medium">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                        <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {offer.price} SOL
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/profile/${offer.from.id}`} className="flex items-center hover:text-primary-600">
                      {offer.from.avatar ? (
                        <img
                          src={offer.from.avatar}
                          alt={offer.from.username || formatAddress(offer.from.walletAddress)}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold mr-2">
                          {(offer.from.username || formatAddress(offer.from.walletAddress)).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>
                        {offer.from.username || formatAddress(offer.from.walletAddress)}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                    {getTimeRemaining(offer.expiresAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-dark-500">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isOwner && !isUserOffer ? (
                      <button
                        className="text-sm text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-md"
                        onClick={() => onAcceptOffer && onAcceptOffer(offer.id)}
                      >
                        Accept
                      </button>
                    ) : isUserOffer ? (
                      <button
                        className="text-sm text-dark-600 hover:text-dark-800 px-3 py-1 rounded-md border border-dark-300 hover:bg-dark-100"
                        onClick={() => onCancelOffer && onCancelOffer(offer.id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-sm text-dark-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersTable;
