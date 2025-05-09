import mongoose, { Schema, Document } from 'mongoose';

export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface IOffer extends Document<mongoose.Types.ObjectId> {
  _id: mongoose.Types.ObjectId;
  nftId: mongoose.Types.ObjectId;
  from: mongoose.Types.ObjectId;
  price: number;
  status: OfferStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  signature?: string;
}

const OfferSchema: Schema = new Schema(
  {
    nftId: {
      type: Schema.Types.ObjectId,
      ref: 'NFT',
      required: true
    },
    from: {
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
      enum: Object.values(OfferStatus),
      default: OfferStatus.ACTIVE
    },
    expiresAt: {
      type: Date,
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
OfferSchema.index({ nftId: 1, status: 1 });
OfferSchema.index({ from: 1, status: 1 });
OfferSchema.index({ expiresAt: 1, status: 1 });

// Add method to check if offer is expired
OfferSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

export default mongoose.model<IOffer>('Offer', OfferSchema);
