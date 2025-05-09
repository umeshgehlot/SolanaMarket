import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document<mongoose.Types.ObjectId> {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  creator: mongoose.Types.ObjectId;
  floorPrice?: number;
  volume?: number;
  verified: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const CollectionSchema: Schema = new Schema(
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
      type: String
    },
    bannerImage: {
      type: String
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    floorPrice: {
      type: Number,
      min: 0
    },
    volume: {
      type: Number,
      min: 0,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for faster queries
CollectionSchema.index({ name: 'text', description: 'text' });
CollectionSchema.index({ creator: 1 });
CollectionSchema.index({ verified: 1 });
CollectionSchema.index({ floorPrice: 1 });
CollectionSchema.index({ volume: 1 });

export default mongoose.model<ICollection>('Collection', CollectionSchema);
