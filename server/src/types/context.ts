import { Request } from 'express';

export interface Context {
  req: Request;
  user?: {
    id: string;
    walletAddress: string;
    username?: string;
  };
}
