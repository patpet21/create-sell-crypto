
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { TokenDetails as TokenDetailsType } from '@/lib/types';
import { TOKEN_CREATOR_ADDRESS, BASE_RPC_URL, TOKEN_CREATOR_ABI } from '@/lib/constants';
import { parseAmount, shortenAddress, getExplorerUrl } from '@/lib/web3';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

export default function TokenDetails() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [token, setToken] = useState<TokenDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (tokenAddress) {
      fetchTokenDetails(tokenAddress);
    }
  }, [tokenAddress]);
  
  const fetchTokenDetails = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Connect to the Base network using the provided RPC URL
      const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);
      
      // Get token creator contract instance
      const tokenCreatorContract = new ethers.Contract(TOKEN_CREATOR_ADDRESS, TOKEN_CREATOR_ABI, provider);
      
      // Get token details
      const [
        fetchedTokenAddress,
        name,
        symbol,
        totalSupply,
        creator,
        imageUrl,
        projectDescription,
        websiteUrl,
        twitterUrl,
        telegramUrl,
      ] = await tokenCreatorContract.getTokenDetails(address);
      
      setToken({
        tokenAddress: fetchedTokenAddress,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        creator,
        imageUrl,
        projectDescription,
        websiteUrl,
        twitterUrl,
        telegramUrl,
      });
    } catch (err: any) {
      console.error('Error fetching token details:', err);
      setError(err.message || 'Failed to fetch token details');
      toast.error('Failed to load token details');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <Link to="/marketplace" className="inline-flex items-center mb-6 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => tokenAddress && fetchTokenDetails(tokenAddress)}>Try Again</Button>
            </div>
          ) : token ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="overflow-hidden border-border/40">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={token.imageUrl} 
                      alt={token.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold">{token.name}</h1>
                      <p className="text-lg text-muted-foreground">{token.symbol}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                        Total Supply: {parseAmount(token.totalSupply)}
                      </Badge>
                    </div>
                    
                    <div className="pt-4 flex flex-wrap gap-2">
                      {token.websiteUrl && (
                        <a 
                          href={token.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Website</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      
                      {token.twitterUrl && (
                        <a 
                          href={token.twitterUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                        >
                          <Twitter className="h-4 w-4" />
                          <span>Twitter</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      
                      {token.telegramUrl && (
                        <a 
                          href={token.telegramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Telegram</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">About</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{token.projectDescription}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Token Details</h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Token Address</span>
                        <a
                          href={getExplorerUrl(token.tokenAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {shortenAddress(token.tokenAddress)}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Creator</span>
                        <a
                          href={getExplorerUrl(token.creator)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {shortenAddress(token.creator)}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Total Supply</span>
                        <span>{parseAmount(token.totalSupply)} {token.symbol}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(getExplorerUrl(token.tokenAddress), '_blank')}
                  >
                    View on Explorer
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Link to="/marketplace" className="w-full">
                    <Button className="w-full">Back to Marketplace</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xl font-medium mb-4">Token not found</p>
              <Link to="/marketplace">
                <Button>Return to Marketplace</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
