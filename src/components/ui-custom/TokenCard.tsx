
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TokenDetails, ListingDetails } from '@/lib/types';
import { shortenAddress, parseAmount, getTimeRemaining } from '@/lib/web3';
import { PAYMENT_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TokenCardProps {
  data: TokenDetails | ListingDetails;
  type: 'token' | 'listing';
  className?: string;
}

export function TokenCard({ data, type, className }: TokenCardProps) {
  // Handle different data types
  const isListing = type === 'listing';
  const listing = data as ListingDetails;
  const token = isListing ? listing.tokenDetails || {} as TokenDetails : data as TokenDetails;
  
  // Determine image URL based on data type
  const imageUrl = isListing 
    ? listing.metadata.tokenImageUrl || 'https://via.placeholder.com/300' 
    : token.imageUrl || 'https://via.placeholder.com/300';
  
  // Determine name and symbol
  const name = token.name || 'Unknown Token';
  const symbol = token.symbol || '???';
  
  // Find payment token info if it's a listing
  const paymentTokenInfo = isListing 
    ? PAYMENT_OPTIONS.find(opt => opt.address.toLowerCase() === listing.paymentToken.toLowerCase()) 
    : undefined;
  
  return (
    <Link to={isListing ? `/marketplace/${listing.id}` : `/token/${token.tokenAddress}`}>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 border-border/40 hover:border-primary/30 hover:shadow-lg group",
          className
        )}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />
          {isListing && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                {getTimeRemaining(listing.endTime)}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg truncate">{name}</h3>
                <p className="text-sm text-muted-foreground">{symbol}</p>
              </div>
              
              {isListing && paymentTokenInfo && (
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {parseAmount(listing.pricePerShare, paymentTokenInfo.decimals)} {paymentTokenInfo.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">per token</p>
                </div>
              )}
            </div>
            
            {!isListing && (
              <p className="text-sm text-muted-foreground truncate">
                Created by {shortenAddress(token.creator)}
              </p>
            )}
            
            {isListing && (
              <p className="text-sm text-muted-foreground truncate">
                {parseAmount(listing.amount)} tokens available
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex-col items-start gap-2">
          {isListing && listing.referralActive && (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {listing.referralPercent}% Referral Reward
            </Badge>
          )}
          
          <div className="w-full pt-2 mt-auto">
            <div className="h-8 flex items-center justify-between text-xs text-muted-foreground">
              <span>View Details</span>
              {isListing ? (
                <span>Seller: {shortenAddress(listing.seller)}</span>
              ) : (
                <span>Supply: {parseAmount(token.totalSupply || '0')}</span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
