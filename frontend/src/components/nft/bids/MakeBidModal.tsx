import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT } from '../../../services/nftService';

interface MakeBidModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: number, expirationDays: number) => void;
}

const MakeBidModal: React.FC<MakeBidModalProps> = ({ nft, isOpen, onClose, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minBidAmount, setMinBidAmount] = useState<number>(0);
  const { connected } = useWallet();

  // Set minimum bid amount based on NFT price
  useEffect(() => {
    if (nft.price) {
      // Minimum bid should be at least the current price
      setMinBidAmount(nft.price);
    } else {
      // If no price, set a minimum of 0.01 SOL
      setMinBidAmount(0.01);
    }
  }, [nft]);
  
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setBidAmount('');
      setExpirationDays(7);
      setError(null);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!connected) {
      setError('Please connect your wallet to place a bid');
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    // Validate minimum bid amount
    if (parseFloat(bidAmount) < minBidAmount) {
      setError(`Bid amount must be at least ${minBidAmount} SOL`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(parseFloat(bidAmount), expirationDays);
      setBidAmount('');
      setExpirationDays(7);
      onClose();
    } catch (error) {
      console.error('Error submitting bid:', error);
      setError(error instanceof Error ? error.message : 'Failed to place bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Place a Bid</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-12 h-12 rounded-md object-cover mr-3" 
                  />
                  <div>
                    <h4 className="font-medium">{nft.name}</h4>
                    <p className="text-sm text-gray-500">
                      {nft.collection?.name || 'Collection'}
                    </p>
                  </div>
                </div>
                                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Amount (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0.00"
                      min={minBidAmount}
                      step="0.01"
                      className="input w-full pr-12"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">SOL</span>
                    </div>
                  </div>
                  
                  {nft.price ? (
                    <p className="mt-1 text-sm text-gray-500">
                      Current price: {nft.price} SOL (minimum bid amount)
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum bid: {minBidAmount} SOL
                    </p>
                  )}
                  
                  {error && (
                    <p className="mt-2 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Expiration
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                    className="select w-full"
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!connected || !bidAmount || parseFloat(bidAmount) <= 0 || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Place Bid'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakeBidModal;
