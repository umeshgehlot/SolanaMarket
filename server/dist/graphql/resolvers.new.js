"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const logger_1 = require("../utils/logger");
const graphql_1 = require("graphql");
const services_1 = require("../services");
// JSON scalar for handling arbitrary metadata
const JSONObjectScalar = new graphql_1.GraphQLScalarType({
    name: 'JSONObject',
    description: 'Arbitrary JSON object',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => {
        // Parse literals as JSON objects
        if (ast.kind === 'ObjectValue') {
            const value = Object.create(null);
            ast.fields.forEach((field) => {
                value[field.name.value] = parseLiteralToJson(field.value);
            });
            return value;
        }
        return null;
    },
});
// Helper function to parse literals
function parseLiteralToJson(ast) {
    switch (ast.kind) {
        case 'IntValue':
            return parseInt(ast.value, 10);
        case 'FloatValue':
            return parseFloat(ast.value);
        case 'StringValue':
            return ast.value;
        case 'BooleanValue':
            return ast.value;
        case 'NullValue':
            return null;
        case 'ListValue':
            return ast.values.map(parseLiteralToJson);
        case 'ObjectValue': {
            const value = Object.create(null);
            ast.fields.forEach((field) => {
                value[field.name.value] = parseLiteralToJson(field.value);
            });
            return value;
        }
        default:
            return null;
    }
}
exports.resolvers = {
    JSONObject: JSONObjectScalar,
    Query: {
        // NFT queries
        nft: async (_, { id }, context) => {
            logger_1.logger.info(`Fetching NFT with id: ${id}`);
            try {
                return await services_1.NFTService.getNFT(id);
            }
            catch (error) {
                logger_1.logger.error('Error fetching NFT:', error);
                return null;
            }
        },
        nfts: async (_, { limit = 20, offset = 0, filter, sort }, context) => {
            logger_1.logger.info(`Fetching NFTs with filter: ${JSON.stringify(filter)}, sort: ${JSON.stringify(sort)}`);
            try {
                return await services_1.NFTService.getNFTs(limit, offset, filter, sort);
            }
            catch (error) {
                logger_1.logger.error('Error fetching NFTs:', error);
                return [];
            }
        },
        // Collection queries
        collection: async (_, { id }, context) => {
            logger_1.logger.info(`Fetching collection with id: ${id}`);
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        collections: async (_, { limit = 20, offset = 0, filter, sort }, context) => {
            logger_1.logger.info(`Fetching collections with filter: ${JSON.stringify(filter)}, sort: ${JSON.stringify(sort)}`);
            // Implementation will connect to database
            return []; // Placeholder for actual implementation
        },
        // User queries
        user: async (_, { id, walletAddress }, context) => {
            logger_1.logger.info(`Fetching user with id: ${id} or walletAddress: ${walletAddress}`);
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        users: async (_, { limit = 20, offset = 0 }, context) => {
            logger_1.logger.info(`Fetching users with limit: ${limit}, offset: ${offset}`);
            // Implementation will connect to database
            return []; // Placeholder for actual implementation
        },
        // Transaction queries
        transactions: async (_, { limit = 20, offset = 0, filter, sort }, context) => {
            logger_1.logger.info(`Fetching transactions with filter: ${JSON.stringify(filter)}, sort: ${JSON.stringify(sort)}`);
            // Implementation will connect to Solana blockchain and database
            return []; // Placeholder for actual implementation
        },
        // Offer queries
        offers: async (_, { nftId, status }, context) => {
            logger_1.logger.info(`Fetching offers for NFT: ${nftId} with status: ${status}`);
            try {
                return await services_1.OfferService.getOffersForNFT(nftId, status);
            }
            catch (error) {
                logger_1.logger.error('Error fetching offers:', error);
                return [];
            }
        },
        offer: async (_, { id }, context) => {
            logger_1.logger.info(`Fetching offer with id: ${id}`);
            try {
                return await services_1.OfferService.getOffer(id);
            }
            catch (error) {
                logger_1.logger.error('Error fetching offer:', error);
                return null;
            }
        },
        // Bid queries
        bids: async (_, { nftId, status }, context) => {
            logger_1.logger.info(`Fetching bids for NFT: ${nftId} with status: ${status}`);
            try {
                return await services_1.BidService.getBidsForNFT(nftId, status);
            }
            catch (error) {
                logger_1.logger.error('Error fetching bids:', error);
                return [];
            }
        },
        bid: async (_, { id }, context) => {
            logger_1.logger.info(`Fetching bid with id: ${id}`);
            try {
                return await services_1.BidService.getBid(id);
            }
            catch (error) {
                logger_1.logger.error('Error fetching bid:', error);
                return null;
            }
        },
        // Stats queries
        marketStats: async (_, __, context) => {
            logger_1.logger.info('Fetching market stats');
            // Implementation will aggregate data from database
            return {
                totalVolume: 0,
                dailyVolume: 0,
                totalNFTs: 0,
                totalCollections: 0,
                totalUsers: 0,
            }; // Placeholder for actual implementation
        },
    },
    Mutation: {
        // NFT mutations
        createNFT: async (_, { input }, context) => {
            logger_1.logger.info(`Creating NFT with input: ${JSON.stringify(input)}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.NFTService.createNFT(walletAddress, input.name, input.description || '', input.image, 'mock-mint-address-' + Date.now(), // In a real implementation, this would be generated by the blockchain
                input.collectionId, input.royaltyPercentage, input.metadata);
            }
            catch (error) {
                logger_1.logger.error('Error creating NFT:', error);
                throw error;
            }
        },
        updateNFT: async (_, { id, input }, context) => {
            logger_1.logger.info(`Updating NFT ${id} with input: ${JSON.stringify(input)}`);
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        listNFT: async (_, { id, price }, context) => {
            logger_1.logger.info(`Listing NFT ${id} for sale at price: ${price}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.NFTService.listNFT(id, walletAddress, price);
            }
            catch (error) {
                logger_1.logger.error('Error listing NFT:', error);
                throw error;
            }
        },
        unlistNFT: async (_, { id }, context) => {
            logger_1.logger.info(`Unlisting NFT ${id} from sale`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.NFTService.unlistNFT(id, walletAddress);
            }
            catch (error) {
                logger_1.logger.error('Error unlisting NFT:', error);
                throw error;
            }
        },
        buyNFT: async (_, { id }, context) => {
            logger_1.logger.info(`Buying NFT ${id}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.NFTService.buyNFT(id, walletAddress);
            }
            catch (error) {
                logger_1.logger.error('Error buying NFT:', error);
                throw error;
            }
        },
        transferNFT: async (_, { id, to }, context) => {
            logger_1.logger.info(`Transferring NFT ${id} to ${to}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.NFTService.transferNFT(id, walletAddress, to);
            }
            catch (error) {
                logger_1.logger.error('Error transferring NFT:', error);
                throw error;
            }
        },
        // Collection mutations
        createCollection: async (_, { input }, context) => {
            logger_1.logger.info(`Creating collection with input: ${JSON.stringify(input)}`);
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        updateCollection: async (_, { id, input }, context) => {
            logger_1.logger.info(`Updating collection ${id} with input: ${JSON.stringify(input)}`);
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        // User mutations
        updateUser: async (_, { input }, context) => {
            logger_1.logger.info(`Updating user with input: ${JSON.stringify(input)}`);
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        // Offer mutations
        makeOffer: async (_, { nftId, price, expirationDays }, context) => {
            logger_1.logger.info(`Making offer for NFT ${nftId} at price: ${price} with expiration: ${expirationDays} days`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.OfferService.makeOffer(nftId, walletAddress, price, expirationDays);
            }
            catch (error) {
                logger_1.logger.error('Error making offer:', error);
                throw error;
            }
        },
        acceptOffer: async (_, { id }, context) => {
            logger_1.logger.info(`Accepting offer: ${id}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.OfferService.acceptOffer(id, walletAddress);
            }
            catch (error) {
                logger_1.logger.error('Error accepting offer:', error);
                throw error;
            }
        },
        cancelOffer: async (_, { id }, context) => {
            logger_1.logger.info(`Cancelling offer: ${id}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.OfferService.cancelOffer(id, walletAddress);
            }
            catch (error) {
                logger_1.logger.error('Error cancelling offer:', error);
                throw error;
            }
        },
        // Bid mutations
        placeBid: async (_, { nftId, price, expirationDays }, context) => {
            logger_1.logger.info(`Placing bid for NFT ${nftId} at price: ${price} with expiration: ${expirationDays} days`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.BidService.placeBid(nftId, walletAddress, price, expirationDays);
            }
            catch (error) {
                logger_1.logger.error('Error placing bid:', error);
                throw error;
            }
        },
        acceptBid: async (_, { id }, context) => {
            logger_1.logger.info(`Accepting bid: ${id}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.BidService.acceptBid(id, walletAddress);
            }
            catch (error) {
                logger_1.logger.error('Error accepting bid:', error);
                throw error;
            }
        },
        cancelBid: async (_, { id }, context) => {
            logger_1.logger.info(`Cancelling bid: ${id}`);
            try {
                // Extract wallet address from context
                const walletAddress = context.user?.walletAddress;
                if (!walletAddress) {
                    throw new Error('Authentication required');
                }
                return await services_1.BidService.cancelBid(id, walletAddress);
            }
            catch (error) {
                logger_1.logger.error('Error cancelling bid:', error);
                throw error;
            }
        }
    },
    // Type resolvers
    NFT: {
        collection: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        creator: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        owner: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        }
    },
    Offer: {
        nft: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        from: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        }
    },
    Bid: {
        nft: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        bidder: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        }
    },
    Collection: {
        creator: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        nfts: async (parent) => {
            // Implementation will connect to database
            return []; // Placeholder for actual implementation
        }
    },
    User: {
        collections: async (parent) => {
            // Implementation will connect to database
            return []; // Placeholder for actual implementation
        },
        ownedNFTs: async (parent) => {
            // Implementation will connect to database
            return []; // Placeholder for actual implementation
        },
        createdNFTs: async (parent) => {
            // Implementation will connect to database
            return []; // Placeholder for actual implementation
        }
    },
    Transaction: {
        nft: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        from: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        },
        to: async (parent) => {
            // Implementation will connect to database
            return null; // Placeholder for actual implementation
        }
    }
};
