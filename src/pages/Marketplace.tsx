
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TokenCard } from '@/components/ui-custom/TokenCard';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ListingDetails, TokenDetails } from '@/lib/types';
import { MARKETPLACE_ADDRESS, BASE_RPC_URL, MARKETPLACE_ABI, TOKEN_CREATOR_ADDRESS, TOKEN_CREATOR_ABI } from '@/lib/constants';
import { getTimeRemaining } from '@/lib/web3';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

export default function Marketplace() {
  const [listings, setListings] = useState<ListingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredListings, setFilteredListings] = useState<ListingDetails[]>([]);
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  useEffect(() => {
    if (listings.length > 0) {
      filterListings();
    }
  }, [searchTerm, listings]);
  
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Connect to the Base network using the provided RPC URL
      const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);
      
      // Get marketplace contract instance
      const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      
      // Get token creator contract instance
      const tokenCreatorContract = new ethers.Contract(TOKEN_CREATOR_ADDRESS, TOKEN_CREATOR_ABI, provider);
      
      // Get the number of listings
      const listingCount = await marketplaceContract.listingCount();
      
      // Fetch all listings
      const fetchedListings: ListingDetails[] = [];
      
      for (let i = 0; i < listingCount.toNumber(); i++) {
        try {
          // Get main listing details
          const [
            seller,
            tokenAddress,
            amount,
            pricePerShare,
            paymentToken,
            active,
            referralActive,
            referralPercent,
            referralCode,
            endTime,
          ] = await marketplaceContract.getListingMainDetails(i);
          
          // Get listing metadata
          const [
            projectWebsite,
            socialMediaLink,
            tokenImageUrl,
            telegramUrl,
            projectDescription,
          ] = await marketplaceContract.getListingMetadata(i);
          
          // Skip inactive listings
          if (!active) continue;
          
          // Check if the listing is expired
          const now = Math.floor(Date.now() / 1000);
          if (endTime.toNumber() < now) continue;
          
          // Get token details
          let tokenDetails: TokenDetails | undefined;
          try {
            const [
              fetchedTokenAddress,
              name,
              symbol,
              totalSupply,
              creator,
              imageUrl,
              tokenProjectDesc,
              websiteUrl,
              twitterUrl,
              tokenTelegramUrl,
            ] = await tokenCreatorContract.getTokenDetails(tokenAddress);
            
            tokenDetails = {
              tokenAddress,
              name,
              symbol,
              totalSupply: totalSupply.toString(),
              creator,
              imageUrl,
              projectDescription: tokenProjectDesc,
              websiteUrl,
              twitterUrl,
              telegramUrl: tokenTelegramUrl,
            };
          } catch (err) {
            console.error(`Failed to fetch token details for listing ${i}:`, err);
          }
          
          // Create listing object
          const listing: ListingDetails = {
            id: i.toString(),
            seller,
            tokenAddress,
            amount: amount.toString(),
            pricePerShare: pricePerShare.toString(),
            paymentToken,
            active,
            referralActive,
            referralPercent: referralPercent.toString(),
            referralCode,
            endTime: endTime.toNumber(),
            metadata: {
              projectWebsite,
              socialMediaLink,
              tokenImageUrl,
              telegramUrl,
              projectDescription,
            },
            tokenDetails,
          };
          
          fetchedListings.push(listing);
        } catch (err) {
          console.error(`Error fetching listing ${i}:`, err);
        }
      }
      
      // Sort listings by newest first
      fetchedListings.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      
      setListings(fetchedListings);
      setFilteredListings(fetchedListings);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Failed to fetch listings');
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };
  
  const filterListings = () => {
    if (!searchTerm.trim()) {
      setFilteredListings(listings);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = listings.filter((listing) => {
      const tokenName = listing.tokenDetails?.name.toLowerCase() || '';
      const tokenSymbol = listing.tokenDetails?.symbol.toLowerCase() || '';
      const description = listing.metadata.projectDescription.toLowerCase() || '';
      
      return (
        tokenName.includes(term) ||
        tokenSymbol.includes(term) ||
        description.includes(term)
      );
    });
    
    setFilteredListings(filtered);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Token Marketplace</h1>
              <p className="text-muted-foreground mt-1">
                Browse and purchase tokens listed by our community
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tokens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-[260px]"
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchListings}>Try Again</Button>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <TokenCard
                  key={listing.id}
                  data={listing}
                  type="listing"
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xl font-medium mb-2">No listings found</p>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term or check back later for new listings.' : 'Be the first to list a token in our marketplace!'}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
