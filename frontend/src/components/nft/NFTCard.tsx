import React from 'react';
import { Link } from 'react-router-dom';

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  collectionName: string;
  collectionImage?: string;
  creator: {
    address: string;
    username?: string;
    avatar?: string;
  };
  owner: {
    address: string;
    username?: string;
    avatar?: string;
  };
  listed: boolean;
  createdAt: string;
  onClick?: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({
  id,
  name,
  image,
  price,
  collectionName,
  collectionImage,
  creator,
  owner,
  listed,
  createdAt,
  onClick,
}) => {
  const displayName = name.length > 20 ? `${name.substring(0, 20)}...` : name;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div 
      className="card card-hover cursor-pointer transition-all duration-300 overflow-hidden"
      onClick={handleClick}
    >
      <Link to={`/nft/${id}`}>
        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {listed && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Listed
            </div>
          )}
        </div>
        
        <div className="p-2">
          <div className="flex items-center mb-2">
            {collectionImage ? (
              <img 
                src={collectionImage} 
                alt={collectionName} 
                className="w-5 h-5 rounded-full mr-2"
              />
            ) : (
              <div className="w-5 h-5 bg-primary-100 rounded-full mr-2"></div>
            )}
            <span className="text-xs text-dark-500">{collectionName}</span>
          </div>
          
          <h3 className="text-base font-semibold mb-1">{displayName}</h3>
          
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-xs text-dark-500 mr-1">Creator:</span>
              <span className="text-xs font-medium">
                {creator.username || formatAddress(creator.address)}
              </span>
            </div>
            <div className="text-xs text-dark-400">{new Date(createdAt).toLocaleDateString()}</div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-dark-100">
            <div className="flex flex-col">
              <span className="text-xs text-dark-500">Price</span>
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" />
                  <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-semibold">{price} SOL</span>
              </div>
            </div>
            <button className="btn btn-primary text-xs py-1">
              {owner.address === creator.address ? 'Buy Now' : 'Place Bid'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NFTCard;
