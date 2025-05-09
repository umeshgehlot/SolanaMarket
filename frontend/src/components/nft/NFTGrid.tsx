import React from 'react';
import NFTCard from './NFTCard';
import { NFT as NFTType } from '../../services/nftService';

interface NFTGridProps {
  nfts: NFTType[];
  loading?: boolean;
  onNFTClick?: (nft: NFTType) => void;
}

const NFTGrid: React.FC<NFTGridProps> = ({ nfts, loading = false, onNFTClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="aspect-square bg-dark-200 rounded-lg mb-3"></div>
            <div className="p-2">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-dark-200 rounded-full mr-2"></div>
                <div className="h-3 bg-dark-200 rounded w-1/2"></div>
              </div>
              <div className="h-5 bg-dark-200 rounded w-3/4 mb-2"></div>
              <div className="flex justify-between items-center mb-2">
                <div className="h-3 bg-dark-200 rounded w-1/3"></div>
                <div className="h-3 bg-dark-200 rounded w-1/4"></div>
              </div>
              <div className="pt-2 border-t border-dark-100 flex justify-between items-center">
                <div className="h-8 bg-dark-200 rounded w-1/3"></div>
                <div className="h-8 bg-dark-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-dark-600 mb-2">No NFTs Found</h3>
        <p className="text-dark-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.id}
          id={nft.id}
          name={nft.name}
          image={nft.image}
          price={nft.price || 0}
          collectionName={nft.collection?.name || ''}
          collectionImage={nft.collection?.image}
          creator={{
            address: nft.creator.walletAddress,
            username: nft.creator.username,
            avatar: nft.creator.avatar
          }}
          owner={{
            address: nft.owner.walletAddress,
            username: nft.owner.username,
            avatar: nft.owner.avatar
          }}
          listed={nft.listed}
          createdAt={nft.createdAt}
          onClick={() => onNFTClick && onNFTClick(nft)}
        />
      ))}
    </div>
  );
};

export default NFTGrid;
