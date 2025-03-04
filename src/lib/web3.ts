
import { ethers } from 'ethers';
import { Contract, Web3Provider } from './types';
import { 
  BASE_CHAIN_ID, 
  BASE_RPC_URL, 
  MARKETPLACE_ADDRESS, 
  MARKETPLACE_ABI, 
  TOKEN_CREATOR_ADDRESS, 
  TOKEN_CREATOR_ABI,
  ERC20_ABI 
} from './constants';
import { toast } from 'sonner';

// Connect to wallet
export async function connectWallet(): Promise<Web3Provider | null> {
  if (!window.ethereum) {
    toast.error('MetaMask or compatible wallet is required');
    return null;
  }

  try {
    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      toast.error('No accounts found');
      return null;
    }

    // Create provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Switch to Base if needed
    const { chainId } = await provider.getNetwork();
    if (chainId !== BASE_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                  chainName: 'Base Mainnet',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [BASE_RPC_URL],
                  blockExplorerUrls: ['https://basescan.org/'],
                },
              ],
            });
          } catch (addError) {
            toast.error('Failed to add Base network');
            return null;
          }
        } else {
          toast.error('Failed to switch to Base network');
          return null;
        }
      }
      
      // Refresh provider after chain switch
      return new ethers.providers.Web3Provider(window.ethereum);
    }

    return provider;
  } catch (error: any) {
    toast.error(`Connection error: ${error.message || 'Unknown error'}`);
    return null;
  }
}

// Get token creator contract
export function getTokenCreatorContract(provider: Web3Provider): Contract {
  const signer = provider.getSigner();
  return new ethers.Contract(TOKEN_CREATOR_ADDRESS, TOKEN_CREATOR_ABI, signer);
}

// Get marketplace contract
export function getMarketplaceContract(provider: Web3Provider): Contract {
  const signer = provider.getSigner();
  return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
}

// Get ERC20 token contract
export function getERC20Contract(tokenAddress: string, provider: Web3Provider): Contract {
  const signer = provider.getSigner();
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}

// Format amount with proper decimals
export function formatAmount(amount: string, decimals: number = 18): string {
  return ethers.utils.parseUnits(amount, decimals).toString();
}

// Parse amount with proper decimals
export function parseAmount(amount: string, decimals: number = 18): string {
  return ethers.utils.formatUnits(amount, decimals);
}

// Shorten address display
export function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Check if address has sufficient allowance for a token
export async function checkAllowance(
  tokenAddress: string, 
  ownerAddress: string, 
  spenderAddress: string, 
  amount: string, 
  provider: Web3Provider
): Promise<boolean> {
  const tokenContract = getERC20Contract(tokenAddress, provider);
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
  const amountBN = ethers.BigNumber.from(amount);
  return allowance.gte(amountBN);
}

// Approve spending of tokens
export async function approveTokens(
  tokenAddress: string, 
  spenderAddress: string, 
  amount: string, 
  provider: Web3Provider
): Promise<boolean> {
  try {
    const tokenContract = getERC20Contract(tokenAddress, provider);
    const tx = await tokenContract.approve(spenderAddress, amount);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error('Approval error:', error);
    toast.error(`Approval failed: ${error.message || 'Unknown error'}`);
    return false;
  }
}

// Format timestamp to readable date
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Calculate time remaining
export function getTimeRemaining(endTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  if (now >= endTime) return 'Expired';
  
  const remainingSeconds = endTime - now;
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Get explorer URL for address
export function getExplorerUrl(address: string): string {
  return `https://basescan.org/address/${address}`;
}

// Get explorer URL for transaction
export function getTxExplorerUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}
