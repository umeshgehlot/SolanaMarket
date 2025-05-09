import mongoose, { Schema, Document, Types } from 'mongoose';

// Define a custom interface without extending Document
export interface NFTAttributes {
  name: string;
  description?: string;
  image: string;
  collectionId?: mongoose.Types.ObjectId; // Renamed to avoid conflict
  creator: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  price?: number;
  royaltyPercentage?: number;
  mintAddress: string;
  tokenAddress?: string;
  metadata?: any;
  listed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Extend Document with our attributes
export interface INFT extends Document, NFTAttributes {}

const NFTSchema: Schema = new Schema(
  {
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
      type: Schema.Types.ObjectId,
      ref: 'Collection'
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.Mixed
    },
    listed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for faster queries
NFTSchema.index({ name: 'text', description: 'text' });
NFTSchema.index({ creator: 1 });
NFTSchema.index({ owner: 1 });
NFTSchema.index({ collection: 1 });
NFTSchema.index({ listed: 1, price: 1 });
NFTSchema.index({ mintAddress: 1 }, { unique: true });

export default mongoose.model<INFT>('NFT', NFTSchema);
