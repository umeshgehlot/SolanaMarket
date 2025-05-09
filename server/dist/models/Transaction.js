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
exports.TransactionType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var TransactionType;
(function (TransactionType) {
    TransactionType["MINT"] = "MINT";
    TransactionType["LIST"] = "LIST";
    TransactionType["UNLIST"] = "UNLIST";
    TransactionType["SALE"] = "SALE";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["OFFER"] = "OFFER";
    TransactionType["ACCEPT_OFFER"] = "ACCEPT_OFFER";
    TransactionType["CANCEL_OFFER"] = "CANCEL_OFFER";
    TransactionType["BID"] = "BID";
    TransactionType["ACCEPT_BID"] = "ACCEPT_BID";
    TransactionType["CANCEL_BID"] = "CANCEL_BID";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
const TransactionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    nft: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'NFT',
        required: true
    },
    from: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        min: 0
    },
    signature: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
// Add indexes for faster queries
TransactionSchema.index({ nft: 1 });
TransactionSchema.index({ from: 1 });
TransactionSchema.index({ to: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ timestamp: -1 });
TransactionSchema.index({ signature: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Transaction', TransactionSchema);
