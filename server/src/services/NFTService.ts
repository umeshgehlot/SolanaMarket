import { Connection, PublicKey } from '@solana/web3.js';
import { NFT, User, Collection, Transaction, TransactionType } from '../models';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Mock data for development
const MOCK_USERS = [
  {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c86'),
    username: 'user1',
    walletAddress: 'wallet-address-1',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c87'),
    username: 'user2',
    walletAddress: 'wallet-address-2',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c88'),
    username: 'user3',
    walletAddress: 'wallet-address-3',
    avatar: 'https://via.placeholder.com/150'
  }
];

const MOCK_NFTS = [
  {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
    name: 'Cosmic Voyager #1',
    description: 'A journey through the cosmos',
    image: 'https://via.placeholder.com/500',
    mintAddress: 'mock-mint-address-1',
    creator: MOCK_USERS[0]._id,
    owner: MOCK_USERS[0]._id,
    price: 1.5,
    listed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    attributes: [
      { trait_type: 'Background', value: 'Space' },
      { trait_type: 'Rarity', value: 'Rare' }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c89'),
    name: 'Digital Dreams #42',
    description: 'A digital masterpiece',
    image: 'https://via.placeholder.com/500',
    mintAddress: 'mock-mint-address-2',
    creator: MOCK_USERS[1]._id,
    owner: MOCK_USERS[1]._id,
    price: 2.0,
    listed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    attributes: [
      { trait_type: 'Background', value: 'Neon' },
      { trait_type: 'Rarity', value: 'Common' }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c90'),
    name: 'Pixel Perfect #7',
    description: 'Pixel art at its finest',
    image: 'https://via.placeholder.com/500',
    mintAddress: 'mock-mint-address-3',
    creator: MOCK_USERS[2]._id,
    owner: MOCK_USERS[2]._id,
    price: 0.75,
    listed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    attributes: [
      { trait_type: 'Background', value: 'Pixel' },
      { trait_type: 'Rarity', value: 'Uncommon' }
    ]
  }
];

class NFTService {
  private connection: Connection;
  private nfts: any[] = MOCK_NFTS;
  private users: any[] = MOCK_USERS;
  
  constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
      'confirmed'
    );
  }
  
  /**
   * Get all NFTs with optional filters
   */
  async getNFTs(filters: any = {}): Promise<any[]> {
    try {
      logger.info(`Getting NFTs with filters: ${JSON.stringify(filters)}`);
      
      // Start with all NFTs
      let filteredNFTs = [...this.nfts];
      
      // Apply filters
      if (filters.listed) {
        const isListed = filters.listed === 'true';
        filteredNFTs = filteredNFTs.filter(nft => nft.listed === isListed);
      }
      
      if (filters.creator) {
        const creator = this.users.find(user => user.walletAddress === filters.creator);
        if (creator) {
          filteredNFTs = filteredNFTs.filter(nft => nft.creator.toString() === creator._id.toString());
        }
      }
      
      if (filters.owner) {
        const owner = this.users.find(user => user.walletAddress === filters.owner);
        if (owner) {
          filteredNFTs = filteredNFTs.filter(nft => nft.owner.toString() === owner._id.toString());
        }
      }
      
      if (filters.collection) {
        // Filter by collection ID
        filteredNFTs = filteredNFTs.filter(nft => nft.collection && nft.collection.toString() === filters.collection);
      }
      
      if (filters.search) {
        // Simple search implementation for mock data
        const searchTerm = filters.search.toLowerCase();
        filteredNFTs = filteredNFTs.filter(nft => 
          nft.name.toLowerCase().includes(searchTerm) || 
          nft.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const direction = filters.sortDirection === 'desc' ? -1 : 1;
        filteredNFTs.sort((a, b) => {
          if (a[filters.sortBy] < b[filters.sortBy]) return -1 * direction;
          if (a[filters.sortBy] > b[filters.sortBy]) return 1 * direction;
          return 0;
        });
      } else {
        // Default sort by newest
        filteredNFTs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      // Apply limit
      const limit = filters.limit ? parseInt(filters.limit) : 50;
      filteredNFTs = filteredNFTs.slice(0, limit);
      
      // Populate creator, owner, and collection data
      const populatedNFTs = filteredNFTs.map(nft => ({
        ...nft,
        creator: this.users.find(user => user._id.toString() === nft.creator.toString()),
        owner: this.users.find(user => user._id.toString() === nft.owner.toString()),
        collection: null // We don't have mock collections yet
      }));
      
      // Apply offset if needed
      const offset = filters.offset ? parseInt(filters.offset) : 0;
      const paginatedNFTs = offset > 0 ? populatedNFTs.slice(offset) : populatedNFTs;
      
      return paginatedNFTs;
    } catch (error) {
      logger.error('Error getting NFTs:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific NFT by ID
   */
  async getNFT(id: string): Promise<any> {
    try {
      logger.info(`Getting NFT with ID: ${id}`);
      
      // Find NFT in mock data
      const nft = this.nfts.find(nft => nft._id.toString() === id);
      
      if (!nft) {
        throw new Error(`NFT with ID ${id} not found`);
      }
      
      // Return NFT with populated creator and owner
      return {
        ...nft,
        creator: this.users.find(user => user._id.toString() === nft.creator.toString()),
        owner: this.users.find(user => user._id.toString() === nft.owner.toString()),
        collection: null // We don't have mock collections yet
      };
    } catch (error) {
      logger.error('Error getting NFT:', error);
      throw error;
    }
  }
  
  /**
   * Get an NFT by mint address
   */
  async getNFTByMintAddress(mintAddress: string): Promise<any> {
    try {
      logger.info(`Getting NFT with mint address: ${mintAddress}`);
      
      // Find NFT in mock data by mint address
      const nft = this.nfts.find(nft => nft.mintAddress === mintAddress);
      
      if (!nft) {
        throw new Error(`NFT with mint address ${mintAddress} not found`);
      }
      
      // Return NFT with populated creator and owner
      return {
        ...nft,
        creator: this.users.find(user => user._id.toString() === nft.creator.toString()),
        owner: this.users.find(user => user._id.toString() === nft.owner.toString()),
        collection: null // We don't have mock collections yet
      };
    } catch (error) {
      logger.error('Error getting NFT by mint address:', error);
      throw error;
    }
  }
  
  /**
   * Create a new NFT
   */
  async createNFT(
    creatorWalletAddress: string,
    name: string,
    description: string,
    image: string,
    mintAddress: string,
    collectionId?: string,
    royaltyPercentage?: number,
    metadata?: any
  ): Promise<any> {
    try {
      logger.info(`Creating NFT: ${name} by ${creatorWalletAddress}`);
      
      // Find or create the creator in mock users
      let creator = this.users.find(user => user.walletAddress === creatorWalletAddress);
      
      // If creator doesn't exist, create a new mock user
      if (!creator) {
        creator = {
          _id: new mongoose.Types.ObjectId(),
          username: `user_${Date.now()}`,
          walletAddress: creatorWalletAddress,
          avatar: 'https://via.placeholder.com/150'
        };
        this.users.push(creator);
        logger.info(`Created new user with wallet address: ${creatorWalletAddress}`);
      }
      
      // Create a new NFT with mock data
      const newNFT = {
        _id: new mongoose.Types.ObjectId(),
        name,
        description,
        image,
        creator: creator._id,
        owner: creator._id, // Initially, creator is the owner
        mintAddress: mintAddress || `mock-mint-address-${Date.now()}`,
        royaltyPercentage: royaltyPercentage || 0,
        metadata: metadata || {},
        listed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        attributes: []
      };
      
      // Add collection if provided (mock implementation)
      if (collectionId) {
        logger.info(`Collection ${collectionId} associated with NFT`);
        // In a real implementation, we would verify the collection exists
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to mint the NFT and get the transaction signature
      const signature = 'mock-signature-' + Date.now();
      
      // Add the new NFT to our mock data
      this.nfts.push(newNFT);
      
      logger.info(`NFT created with ID: ${newNFT._id}`);
      logger.info(`Mock transaction signature: ${signature}`);
      
      // Return the populated NFT
      return {
        ...newNFT,
        creator: {
          _id: creator._id,
          username: creator.username,
          walletAddress: creator.walletAddress,
          avatar: creator.avatar
        },
        owner: {
          _id: creator._id,
          username: creator.username,
          walletAddress: creator.walletAddress,
          avatar: creator.avatar
        },
        collection: null // We don't have mock collections yet
      };
    } catch (error) {
      logger.error('Error creating NFT:', error);
      throw error;
    }
  }
  
  /**
   * List an NFT for sale
   */
  async listNFT(nftId: string, ownerWalletAddress: string, price: number): Promise<any> {
    try {
      logger.info(`Listing NFT ${nftId} for sale by ${ownerWalletAddress} at price ${price}`);
      
      // Find the NFT in mock data
      const nftIndex = this.nfts.findIndex(nft => nft._id.toString() === nftId);
      if (nftIndex === -1) {
        throw new Error(`NFT with ID ${nftId} not found`);
      }
      
      const nft = this.nfts[nftIndex];
      
      // Find the owner in mock data
      const owner = this.users.find(user => user.walletAddress === ownerWalletAddress);
      if (!owner) {
        throw new Error(`User with wallet address ${ownerWalletAddress} not found`);
      }
      
      // Check if the user is the owner of the NFT
      if (nft.owner.toString() !== owner._id.toString()) {
        throw new Error('Only the NFT owner can list it for sale');
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to list the NFT for sale
      const signature = 'mock-signature-' + Date.now();
      
      // Update the NFT in mock data
      this.nfts[nftIndex].listed = true;
      this.nfts[nftIndex].price = price;
      this.nfts[nftIndex].updatedAt = new Date();
      
      // Log transaction creation (instead of creating in DB)
      logger.info(`Created transaction record for listing NFT ${nftId}`);
      logger.info(`Mock transaction signature: ${signature}`);
      
      // Return the updated NFT with populated data
      return {
        ...this.nfts[nftIndex],
        creator: this.users.find(user => user._id.toString() === nft.creator.toString()),
        owner: this.users.find(user => user._id.toString() === nft.owner.toString()),
        collection: null // We don't have mock collections yet
      };
    } catch (error) {
      logger.error('Error listing NFT:', error);
      throw error;
    }
  }
  /**
   * Unlist an NFT
   */
  async unlistNFT(nftId: string, ownerWalletAddress: string): Promise<any> {
    try {
      logger.info(`Unlisting NFT ${nftId} by ${ownerWalletAddress}`);
      
      // Find the NFT in mock data
      const nftIndex = this.nfts.findIndex(nft => nft._id.toString() === nftId);
      if (nftIndex === -1) {
        throw new Error(`NFT with ID ${nftId} not found`);
      }
      
      const nft = this.nfts[nftIndex];
      
      // Find the owner in mock data
      const owner = this.users.find(user => user.walletAddress === ownerWalletAddress);
      if (!owner) {
        throw new Error(`User with wallet address ${ownerWalletAddress} not found`);
      }
      
      // Check if the user is the owner of the NFT
      if (nft.owner.toString() !== owner._id.toString()) {
        throw new Error('Only the NFT owner can unlist it');
      }
      
      // Check if the NFT is listed
      if (!nft.listed) {
        throw new Error('NFT is not listed for sale');
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to unlist the NFT
      const signature = 'mock-signature-' + Date.now();
      
      // Update the NFT in mock data
      this.nfts[nftIndex].listed = false;
      this.nfts[nftIndex].price = undefined;
      this.nfts[nftIndex].updatedAt = new Date();
      
      // Log transaction creation (instead of creating in DB)
      logger.info(`Created transaction record for unlisting NFT ${nftId}`);
      logger.info(`Mock transaction signature: ${signature}`);
      
      // Return the updated NFT with populated data
      return {
        ...this.nfts[nftIndex],
        creator: this.users.find(user => user._id.toString() === nft.creator.toString()),
        owner: this.users.find(user => user._id.toString() === nft.owner.toString()),
        collection: null // We don't have mock collections yet
      };
    } catch (error) {
      logger.error('Error unlisting NFT:', error);
      throw error;
    }
  }
  
  /**
   * Buy an NFT
   */
  async buyNFT(nftId: string, buyerWalletAddress: string): Promise<any> {
    try {
      // Find the NFT
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error(`NFT with ID ${nftId} not found`);
      }
      
      // Check if the NFT is listed
      if (!nft.listed) {
        throw new Error('NFT is not listed for sale');
      }
      
      // Find or create the buyer
      let buyer = await User.findOne({ walletAddress: buyerWalletAddress });
      if (!buyer) {
        buyer = await User.create({ walletAddress: buyerWalletAddress });
      }
      
      // Find the current owner
      const owner = await User.findById(nft.owner);
      if (!owner) {
        throw new Error('NFT owner not found');
      }
      
      // Check that buyer is not the owner
      if (buyer._id.toString() === owner._id.toString()) {
        throw new Error('You already own this NFT');
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to process the purchase, transfer the NFT, and handle payment
      const signature = 'mock-signature-' + Date.now();
      
      // Update the NFT
      nft.owner = buyer._id;
      nft.listed = false;
      const price = nft.price;
      nft.price = undefined;
      await nft.save();
      
      // Create a transaction record
      const transaction = await Transaction.create({
        type: TransactionType.SALE,
        nft: nft._id,
        from: owner._id,
        to: buyer._id,
        price,
        signature,
        timestamp: new Date()
      });
      
      // Return the populated transaction
      return await Transaction.findById(transaction._id)
        .populate('nft', 'name image mintAddress')
        .populate('from', 'walletAddress username avatar')
        .populate('to', 'walletAddress username avatar');
    } catch (error) {
      logger.error('Error buying NFT:', error);
      throw error;
    }
  }
  
  /**
   * Transfer an NFT to another user
   */
  async transferNFT(nftId: string, fromWalletAddress: string, toWalletAddress: string): Promise<any> {
    try {
      // Find the NFT
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error(`NFT with ID ${nftId} not found`);
      }
      
      // Find the current owner
      const fromUser = await User.findOne({ walletAddress: fromWalletAddress });
      if (!fromUser) {
        throw new Error(`User with wallet address ${fromWalletAddress} not found`);
      }
      
      // Check if the user is the owner of the NFT
      if (nft.owner.toString() !== fromUser._id.toString()) {
        throw new Error('Only the NFT owner can transfer it');
      }
      
      // Find or create the recipient
      let toUser = await User.findOne({ walletAddress: toWalletAddress });
      if (!toUser) {
        toUser = await User.create({ walletAddress: toWalletAddress });
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to transfer the NFT
      const signature = 'mock-signature-' + Date.now();
      
      // Update the NFT
      nft.owner = toUser._id;
      nft.listed = false;
      nft.price = undefined;
      await nft.save();
      
      // Create a transaction record
      const transaction = await Transaction.create({
        type: TransactionType.TRANSFER,
        nft: nft._id,
        from: fromUser._id,
        to: toUser._id,
        signature,
        timestamp: new Date()
      });
      
      // Return the populated transaction
      return await Transaction.findById(transaction._id)
        .populate('nft', 'name image mintAddress')
        .populate('from', 'walletAddress username avatar')
        .populate('to', 'walletAddress username avatar');
    } catch (error) {
      logger.error('Error transferring NFT:', error);
      throw error;
    }
  }
}

export default new NFTService();
