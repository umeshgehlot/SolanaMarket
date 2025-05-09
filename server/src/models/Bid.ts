import mongoose, { Schema, Document } from 'mongoose';

export enum BidStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface IBid extends Document<mongoose.Types.ObjectId> {
  _id: mongoose.Types.ObjectId;
  nftId: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  price: number;
  status: BidStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  escrowAccount: string;
  signature?: string;
}

const BidSchema: Schema = new Schema(
  {
    nftId: {
      type: Schema.Types.ObjectId,
      ref: 'NFT',
      required: true
    },
    bidder: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true
  }
);

// Add index for faster queries
BidSchema.index({ nftId: 1, status: 1 });
BidSchema.index({ bidder: 1, status: 1 });
BidSchema.index({ expiresAt: 1, status: 1 });

// Add method to check if bid is expired
BidSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

export default mongoose.model<IBid>('Bid', BidSchema);
