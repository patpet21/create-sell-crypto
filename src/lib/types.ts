
import { ethers } from 'ethers';

export interface TokenMetadata {
  imageUrl: string;
  projectDescription: string;
  websiteUrl: string;
  twitterUrl: string;
  telegramUrl: string;
}

export interface TokenDetails extends TokenMetadata {
  tokenAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  creator: string;
}

export interface MarketplaceMetadata {
  projectWebsite: string;
  socialMediaLink: string;
  tokenImageUrl: string;
  telegramUrl: string;
  projectDescription: string;
}

export interface ListingDetails {
  id: string;
  seller: string;
  tokenAddress: string;
  amount: string;
  pricePerShare: string;
  paymentToken: string;
  active: boolean;
  referralActive: boolean;
  referralPercent: string;
  referralCode: string;
  endTime: number;
  metadata: MarketplaceMetadata;
  tokenDetails?: TokenDetails;
}

export type Web3Provider = ethers.providers.Web3Provider;
export type Contract = ethers.Contract;

export interface WalletState {
  address: string | null;
  provider: Web3Provider | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface TransactionState {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}

export interface TokenCreationParams {
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  imageLink: string;
  projectDesc: string;
  websiteLink: string;
  twitterLink: string;
  telegramLink: string;
}

export interface TokenListingParams {
  tokenAddress: string;
  amount: string;
  pricePerShare: string;
  paymentToken: string;
  referralActive: boolean;
  referralPercent: string;
  metadata: MarketplaceMetadata;
  durationInSeconds: number;
}
