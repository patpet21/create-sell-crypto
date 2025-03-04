
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { connectWallet, shortenAddress, getExplorerUrl } from '@/lib/web3';
import { WalletState } from '@/lib/types';
import { ExternalLink, Copy, LogOut, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ConnectWalletProps {
  className?: string;
}

export function ConnectWallet({ className }: ConnectWalletProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    provider: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleConnect();
          }
        })
        .catch(console.error);
      
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          handleConnect();
        }
      });
      
      // Handle chain changes
      window.ethereum.on('chainChanged', () => {
        handleConnect();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handleConnect = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      const provider = await connectWallet();
      
      if (!provider) {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Failed to connect wallet',
        }));
        return;
      }
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setWalletState({
        address,
        provider,
        chainId: network.chainId,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Unknown error',
      }));
    }
  };

  const handleDisconnect = () => {
    setWalletState({
      address: null,
      provider: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (walletState.address) {
      window.open(getExplorerUrl(walletState.address), '_blank');
    }
  };

  if (!walletState.address) {
    return (
      <Button
        className={cn("relative overflow-hidden group", className)}
        onClick={handleConnect}
        disabled={walletState.isConnecting}
        size="sm"
      >
        <span className="relative z-10">
          {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "relative overflow-hidden transition-all duration-300 border-primary/20 hover:border-primary/50 px-3", 
            className
          )}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 absolute left-2 top-1/2 transform -translate-y-1/2" />
          <span className="ml-3">{shortenAddress(walletState.address)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
