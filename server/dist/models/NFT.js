"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const NFTSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    collectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Collection'
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        min: 0
    },
    royaltyPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    mintAddress: {
        type: String,
        required: true,
        unique: true
    },
    tokenAddress: {
        type: String
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed
    },
    listed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Add indexes for faster queries
NFTSchema.index({ name: 'text', description: 'text' });
NFTSchema.index({ creator: 1 });
NFTSchema.index({ owner: 1 });
NFTSchema.index({ collection: 1 });
NFTSchema.index({ listed: 1, price: 1 });
NFTSchema.index({ mintAddress: 1 }, { unique: true });
exports.default = mongoose_1.default.model('NFT', NFTSchema);
