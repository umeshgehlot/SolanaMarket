import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  MINT = 'MINT',
  LIST = 'LIST',
  UNLIST = 'UNLIST',
  SALE = 'SALE',
  TRANSFER = 'TRANSFER',
  OFFER = 'OFFER',
  ACCEPT_OFFER = 'ACCEPT_OFFER',
  CANCEL_OFFER = 'CANCEL_OFFER',
  BID = 'BID',
  ACCEPT_BID = 'ACCEPT_BID',
  CANCEL_BID = 'CANCEL_BID'
}

export interface ITransaction extends Document<mongoose.Types.ObjectId> {
  _id: mongoose.Types.ObjectId;
  type: TransactionType;
  nft: mongoose.Types.ObjectId;
  from?: mongoose.Types.ObjectId;
  to?: mongoose.Types.ObjectId;
  price?: number;
  signature: string;
  timestamp: Date;
}

const TransactionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  nft: {
    type: Schema.Types.ObjectId,
    ref: 'NFT',
    required: true
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: Schema.Types.ObjectId,
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

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
