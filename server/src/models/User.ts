import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document<mongoose.Types.ObjectId> {
  _id: mongoose.Types.ObjectId;
  walletAddress: string;
  username?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      unique: true
    },
    avatar: {
      type: String
    },
    bio: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    discord: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for faster queries
UserSchema.index({ walletAddress: 1 }, { unique: true });
UserSchema.index({ username: 'text' });

export default mongoose.model<IUser>('User', UserSchema);
