"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
class OfferService {
    constructor() {
        // Initialize Solana connection
        this.connection = new web3_js_1.Connection(process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com', 'confirmed');
    }
    /**
     * Get all offers for an NFT
     */
    async getOffersForNFT(nftId, status) {
        try {
            const query = { nftId };
            if (status) {
                query.status = status;
            }
            else {
                // By default, only return active offers
                query.status = models_1.OfferStatus.ACTIVE;
            }
            // Check for expired offers and update their status
            await this.updateExpiredOffers();
            const offers = await models_1.Offer.find(query)
                .populate('from', 'walletAddress username avatar')
                .sort({ price: -1, createdAt: -1 });
            return offers;
        }
        catch (error) {
            logger_1.logger.error('Error getting offers for NFT:', error);
            throw error;
        }
    }
    /**
     * Get a specific offer by ID
     */
    async getOffer(id) {
        try {
            const offer = await models_1.Offer.findById(id)
                .populate('from', 'walletAddress username avatar')
                .populate('nftId', 'name image mintAddress');
            if (!offer) {
                throw new Error(`Offer with ID ${id} not found`);
            }
            return offer;
        }
        catch (error) {
            logger_1.logger.error('Error getting offer:', error);
            throw error;
        }
    }
    /**
     * Make an offer on an NFT
     */
    async makeOffer(nftId, fromWalletAddress, price, expirationDays) {
        try {
            // Find the NFT
            const nft = await models_1.NFT.findById(nftId);
            if (!nft) {
                throw new Error(`NFT with ID ${nftId} not found`);
            }
            // Find or create the user making the offer
            let fromUser = await models_1.User.findOne({ walletAddress: fromWalletAddress });
            if (!fromUser) {
                fromUser = await models_1.User.create({ walletAddress: fromWalletAddress });
            }
            // Calculate expiration date
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expirationDays);
            // In a real implementation, this would interact with the Solana blockchain
            // to validate the offer and potentially reserve funds
            const signature = 'mock-signature-' + Date.now();
            // Create the offer in the database
            const offer = await models_1.Offer.create({
                nftId: nft._id,
                from: fromUser._id,
                price,
                status: models_1.OfferStatus.ACTIVE,
                expiresAt,
                signature
            });
            // Create a transaction record
            await models_1.Transaction.create({
                type: models_1.TransactionType.OFFER,
                nft: nft._id,
                from: fromUser._id,
                price,
                signature,
                timestamp: new Date()
            });
            // Return the populated offer
            return await models_1.Offer.findById(offer._id)
                .populate('from', 'walletAddress username avatar')
                .populate('nftId', 'name image mintAddress');
        }
        catch (error) {
            logger_1.logger.error('Error making offer:', error);
            throw error;
        }
    }
    /**
     * Accept an offer
     */
    async acceptOffer(offerId, ownerWalletAddress) {
        try {
            // Find the offer
            const offer = await models_1.Offer.findById(offerId);
            if (!offer) {
                throw new Error(`Offer with ID ${offerId} not found`);
            }
            // Check if offer is active
            if (offer.status !== models_1.OfferStatus.ACTIVE) {
                throw new Error(`Offer is not active, current status: ${offer.status}`);
            }
            // Check if offer is expired
            if (offer.expiresAt < new Date()) {
                offer.status = models_1.OfferStatus.EXPIRED;
                await offer.save();
                throw new Error('Offer has expired');
            }
            // Find the NFT
            const nft = await models_1.NFT.findById(offer.nftId);
            if (!nft) {
                throw new Error(`NFT with ID ${offer.nftId} not found`);
            }
            // Find or create the owner
            let owner = await models_1.User.findOne({ walletAddress: ownerWalletAddress });
            if (!owner) {
                owner = await models_1.User.create({ walletAddress: ownerWalletAddress });
            }
            // Check if owner is the owner of the NFT
            if (nft.owner.toString() !== owner._id.toString()) {
                throw new Error('Only the NFT owner can accept offers');
            }
            // In a real implementation, this would interact with the Solana blockchain
            // to accept the offer, transfer the NFT, and process the payment
            const signature = 'mock-signature-' + Date.now();
            // Update the offer status
            offer.status = models_1.OfferStatus.ACCEPTED;
            await offer.save();
            // Update the NFT owner
            nft.owner = offer.from;
            nft.listed = false;
            nft.price = undefined;
            await nft.save();
            // Create a transaction record
            const transaction = await models_1.Transaction.create({
                type: models_1.TransactionType.ACCEPT_OFFER,
                nft: nft._id,
                from: owner._id,
                to: offer.from,
                price: offer.price,
                signature,
                timestamp: new Date()
            });
            // Return the populated transaction
            return await models_1.Transaction.findById(transaction._id)
                .populate('nft', 'name image mintAddress')
                .populate('from', 'walletAddress username avatar')
                .populate('to', 'walletAddress username avatar');
        }
        catch (error) {
            logger_1.logger.error('Error accepting offer:', error);
            throw error;
        }
    }
    /**
     * Cancel an offer
     */
    async cancelOffer(offerId, fromWalletAddress) {
        try {
            // Find the offer
            const offer = await models_1.Offer.findById(offerId);
            if (!offer) {
                throw new Error(`Offer with ID ${offerId} not found`);
            }
            // Check if offer is active
            if (offer.status !== models_1.OfferStatus.ACTIVE) {
                throw new Error(`Offer is not active, current status: ${offer.status}`);
            }
            // Find the user who made the offer
            const fromUser = await models_1.User.findOne({ walletAddress: fromWalletAddress });
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
            offer.status = models_1.OfferStatus.CANCELLED;
            await offer.save();
            // Create a transaction record
            const transaction = await models_1.Transaction.create({
                type: models_1.TransactionType.CANCEL_OFFER,
                nft: offer.nftId,
                from: fromUser._id,
                price: offer.price,
                signature,
                timestamp: new Date()
            });
            // Return the populated transaction
            return await models_1.Transaction.findById(transaction._id)
                .populate('nft', 'name image mintAddress')
                .populate('from', 'walletAddress username avatar');
        }
        catch (error) {
            logger_1.logger.error('Error cancelling offer:', error);
            throw error;
        }
    }
    /**
     * Update expired offers
     */
    async updateExpiredOffers() {
        try {
            const now = new Date();
            await models_1.Offer.updateMany({ status: models_1.OfferStatus.ACTIVE, expiresAt: { $lt: now } }, { $set: { status: models_1.OfferStatus.EXPIRED } });
        }
        catch (error) {
            logger_1.logger.error('Error updating expired offers:', error);
        }
    }
}
exports.default = new OfferService();
