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
exports.BidStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BidStatus;
(function (BidStatus) {
    BidStatus["ACTIVE"] = "ACTIVE";
    BidStatus["ACCEPTED"] = "ACCEPTED";
    BidStatus["CANCELLED"] = "CANCELLED";
    BidStatus["EXPIRED"] = "EXPIRED";
})(BidStatus = exports.BidStatus || (exports.BidStatus = {}));
const BidSchema = new mongoose_1.Schema({
    nftId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'NFT',
        required: true
    },
    bidder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(BidStatus),
        default: BidStatus.ACTIVE
    },
    expiresAt: {
        type: Date,
        required: true
    },
    escrowAccount: {
        type: String,
        required: true
    },
    signature: {
        type: String
    }
}, {
    timestamps: true
});
// Add index for faster queries
BidSchema.index({ nftId: 1, status: 1 });
BidSchema.index({ bidder: 1, status: 1 });
BidSchema.index({ expiresAt: 1, status: 1 });
// Add method to check if bid is expired
BidSchema.methods.isExpired = function () {
    return this.expiresAt < new Date();
};
exports.default = mongoose_1.default.model('Bid', BidSchema);
