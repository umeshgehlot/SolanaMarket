import { Connection, PublicKey } from '@solana/web3.js';
import { Offer, OfferStatus, NFT, User, Transaction, TransactionType } from '../models';
import { logger } from '../utils/logger';

class OfferService {
  private connection: Connection;
  
  constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
      'confirmed'
    );
  }
  
  /**
   * Get all offers for an NFT
   */
  async getOffersForNFT(nftId: string, status?: OfferStatus): Promise<any[]> {
    try {
      const query: any = { nftId };
      
      if (status) {
        query.status = status;
      } else {
        // By default, only return active offers
        query.status = OfferStatus.ACTIVE;
      }
      
      // Check for expired offers and update their status
      await this.updateExpiredOffers();
      
      const offers = await Offer.find(query)
        .populate('from', 'walletAddress username avatar')
        .sort({ price: -1, createdAt: -1 });
      
      return offers;
    } catch (error) {
      logger.error('Error getting offers for NFT:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific offer by ID
   */
  async getOffer(id: string): Promise<any> {
    try {
      const offer = await Offer.findById(id)
        .populate('from', 'walletAddress username avatar')
        .populate('nftId', 'name image mintAddress');
      
      if (!offer) {
        throw new Error(`Offer with ID ${id} not found`);
      }
      
      return offer;
    } catch (error) {
      logger.error('Error getting offer:', error);
      throw error;
    }
  }
  
  /**
   * Make an offer on an NFT
   */
  async makeOffer(nftId: string, fromWalletAddress: string, price: number, expirationDays: number): Promise<any> {
    try {
      // Find the NFT
      const nft = await NFT.findById(nftId);
      if (!nft) {
        throw new Error(`NFT with ID ${nftId} not found`);
      }
      
      // Find or create the user making the offer
      let fromUser = await User.findOne({ walletAddress: fromWalletAddress });
      if (!fromUser) {
        fromUser = await User.create({ walletAddress: fromWalletAddress });
      }
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
      
      // In a real implementation, this would interact with the Solana blockchain
      // to validate the offer and potentially reserve funds
      const signature = 'mock-signature-' + Date.now();
      
      // Create the offer in the database
      const offer = await Offer.create({
        nftId: nft._id,
        from: fromUser._id,
        price,
        status: OfferStatus.ACTIVE,
        expiresAt,
        signature
      });
      
      // Create a transaction record
      await Transaction.create({
        type: TransactionType.OFFER,
        nft: nft._id,
        from: fromUser._id,
        price,
        signature,
        timestamp: new Date()
      });
      
      // Return the populated offer
      return await Offer.findById(offer._id)
        .populate('from', 'walletAddress username avatar')
        .populate('nftId', 'name image mintAddress');
    } catch (error) {
      logger.error('Error making offer:', error);
      throw error;
    }
  }
  
  /**
   * Accept an offer
   */
  async acceptOffer(offerId: string, ownerWalletAddress: string): Promise<any> {
    try {
      // Find the offer
      const offer = await Offer.findById(offerId);
      if (!offer) {
        throw new Error(`Offer with ID ${offerId} not found`);
      }
      
      // Check if offer is active
      if (offer.status !== OfferStatus.ACTIVE) {
        throw new Error(`Offer is not active, current status: ${offer.status}`);
      }
      
      // Check if offer is expired
      if (offer.expiresAt < new Date()) {
        offer.status = OfferStatus.EXPIRED;
        await offer.save();
        throw new Error('Offer has expired');
      }
      
      // Find the NFT
      const nft = await NFT.findById(offer.nftId);
      if (!nft) {
        throw new Error(`NFT with ID ${offer.nftId} not found`);
      }
      
      // Find or create the owner
      let owner = await User.findOne({ walletAddress: ownerWalletAddress });
      if (!owner) {
        owner = await User.create({ walletAddress: ownerWalletAddress });
      }
      
      // Check if owner is the owner of the NFT
      if (nft.owner.toString() !== owner._id.toString()) {
        throw new Error('Only the NFT owner can accept offers');
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to accept the offer, transfer the NFT, and process the payment
      const signature = 'mock-signature-' + Date.now();
      
      // Update the offer status
      offer.status = OfferStatus.ACCEPTED;
      await offer.save();
      
      // Update the NFT owner
      nft.owner = offer.from;
      nft.listed = false;
      nft.price = undefined;
      await nft.save();
      
      // Create a transaction record
      const transaction = await Transaction.create({
        type: TransactionType.ACCEPT_OFFER,
        nft: nft._id,
        from: owner._id,
        to: offer.from,
        price: offer.price,
        signature,
        timestamp: new Date()
      });
      
      // Return the populated transaction
      return await Transaction.findById(transaction._id)
        .populate('nft', 'name image mintAddress')
        .populate('from', 'walletAddress username avatar')
        .populate('to', 'walletAddress username avatar');
    } catch (error) {
      logger.error('Error accepting offer:', error);
      throw error;
    }
  }
  
  /**
   * Cancel an offer
   */
  async cancelOffer(offerId: string, fromWalletAddress: string): Promise<any> {
    try {
      // Find the offer
      const offer = await Offer.findById(offerId);
      if (!offer) {
        throw new Error(`Offer with ID ${offerId} not found`);
      }
      
      // Check if offer is active
      if (offer.status !== OfferStatus.ACTIVE) {
        throw new Error(`Offer is not active, current status: ${offer.status}`);
      }
      
      // Find the user who made the offer
      const fromUser = await User.findOne({ walletAddress: fromWalletAddress });
      if (!fromUser) {
        throw new Error(`User with wallet address ${fromWalletAddress} not found`);
      }
      
      // Check if the user is the one who made the offer
      if (offer.from.toString() !== fromUser._id.toString()) {
        throw new Error('Only the user who made the offer can cancel it');
      }
      
      // In a real implementation, this would interact with the Solana blockchain
      // to cancel the offer and release any reserved funds
      const signature = 'mock-signature-' + Date.now();
      
      // Update the offer status
      offer.status = OfferStatus.CANCELLED;
      await offer.save();
      
      // Create a transaction record
      const transaction = await Transaction.create({
        type: TransactionType.CANCEL_OFFER,
        nft: offer.nftId,
        from: fromUser._id,
        price: offer.price,
        signature,
        timestamp: new Date()
      });
      
      // Return the populated transaction
      return await Transaction.findById(transaction._id)
        .populate('nft', 'name image mintAddress')
        .populate('from', 'walletAddress username avatar');
    } catch (error) {
      logger.error('Error cancelling offer:', error);
      throw error;
    }
  }
  
  /**
   * Update expired offers
   */
  private async updateExpiredOffers(): Promise<void> {
    try {
      const now = new Date();
      await Offer.updateMany(
        { status: OfferStatus.ACTIVE, expiresAt: { $lt: now } },
        { $set: { status: OfferStatus.EXPIRED } }
      );
    } catch (error) {
      logger.error('Error updating expired offers:', error);
    }
  }
}

export default new OfferService();
