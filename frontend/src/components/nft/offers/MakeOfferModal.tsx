import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NFT as NFTType } from '../../../services/nftService';

interface MakeOfferModalProps {
  nft: NFTType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: number, expirationDays: number) => Promise<void>;
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  nft,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [price, setPrice] = useState<string>('');
  const [expirationDays, setExpirationDays] = useState<string>('7');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connected, publicKey } = useWallet();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!expirationDays || parseInt(expirationDays) <= 0) {
      setError('Please enter a valid expiration period');
      return;
    }
    
    // Check if user is connected
    if (!connected || !publicKey) {
      setError('Please connect your wallet to make an offer');
      return;
    }
    
    // Check if user is trying to make an offer on their own NFT
    if (publicKey.toString() === nft.owner.walletAddress) {
      setError('You cannot make an offer on your own NFT');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit(parseFloat(price), parseInt(expirationDays));
      onClose();
    } catch (err) {
      console.error('Error making offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to make offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-dark-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-dark-900" id="modal-title">
                  Make an Offer
                </h3>
                
                <div className="mt-4 flex items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                    <img 
                      src={nft.image} 
                      alt={nft.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{nft.name}</h4>
                    <p className="text-sm text-dark-500">
                      {nft.collection?.name}
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-dark-700 mb-1">
                      Offer Price (SOL)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        id="price"
                        className="block w-full pr-12 pl-3 py-2 border border-dark-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-dark-500 sm:text-sm">SOL</span>
                      </div>
                    </div>
                    
                    {nft.price && (
                      <p className="mt-1 text-sm text-dark-500">
                        Listed price: {nft.price} SOL
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="expiration" className="block text-sm font-medium text-dark-700 mb-1">
                      Offer Expiration
                    </label>
                    <select
                      id="expiration"
                      className="block w-full pl-3 pr-10 py-2 border border-dark-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(e.target.value)}
                    >
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-dark-500">
                      You'll be asked to confirm this offer with your wallet
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Make Offer'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-dark-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-dark-700 hover:bg-dark-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferModal;
