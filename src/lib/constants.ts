
export const MARKETPLACE_ADDRESS = '0x739320823aFDaCB183fd658F25BD21dEc07D3464';
export const PRDX_TOKEN_ADDRESS = '0x61Dd008F1582631Aa68645fF92a1a5ECAedBeD19';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const TOKEN_CREATOR_ADDRESS = '0x01A3ad1acc738cb60d48E08ccadC769904De256c';
export const FEE_RECIPIENT = '0x7fDECF16574bd21Fd5cce60B701D01A6F83826ab';

export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = 'https://mainnet.base.org';

export const TOKEN_CREATOR_ABI = [
  "function createToken(string memory tokenName, string memory tokenSymbol, uint256 initialSupply, string memory imageLink, string memory projectDesc, string memory websiteLink, string memory twitterLink, string memory telegramLink) external returns (tuple(address tokenAddress, string name, string symbol, uint256 initialSupply, address creator, string imageUrl, string projectDescription, string websiteUrl, string twitterUrl, string telegramUrl))",
  "function getAllTokens() external view returns (address[] memory)",
  "function getTokenDetails(address tokenAddress) external view returns (address, string memory, string memory, uint256, address, string memory, string memory, string memory, string memory, string memory)"
];

export const MARKETPLACE_ABI = [
  "function listToken(address tokenAddress, uint256 amount, uint256 pricePerShare, address paymentToken, bool referralActive, uint256 referralPercent, tuple(string projectWebsite, string socialMediaLink, string tokenImageUrl, string telegramUrl, string projectDescription) memory metadata, uint256 durationInSeconds) external",
  "function buyToken(uint256 listingId, uint256 amount, bytes32 referralCode) external",
  "function cancelListing(uint256 listingId) external",
  "function generateBuyerReferralCode(uint256 listingId) external returns (bytes32)",
  "function listingCount() external view returns (uint256)",
  "function getListingMainDetails(uint256 listingId) external view returns (address seller, address tokenAddress, uint256 amount, uint256 pricePerShare, address paymentToken, bool active, bool referralActive, uint256 referralPercent, bytes32 referralCode, uint256 endTime)",
  "function getListingMetadata(uint256 listingId) external view returns (string memory projectWebsite, string memory socialMediaLink, string memory tokenImageUrl, string memory telegramUrl, string memory projectDescription)"
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
];

export const PAYMENT_OPTIONS = [
  { 
    address: PRDX_TOKEN_ADDRESS, 
    symbol: 'PRDX',
    name: 'Properties DEX Token',
    decimals: 18
  },
  { 
    address: USDC_ADDRESS, 
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  }
];

export const DEFAULT_LISTING_DURATION_OPTIONS = [
  { value: 86400, label: '1 Day' },
  { value: 604800, label: '1 Week' },
  { value: 2592000, label: '30 Days' },
  { value: 7776000, label: '90 Days' },
];

export const APP_NAME = 'PropertyDEX';
