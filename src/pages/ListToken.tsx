
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ConnectWallet } from '@/components/ui-custom/ConnectWallet';
import { 
  getMarketplaceContract, 
  getERC20Contract, 
  approveTokens, 
  checkAllowance,
  formatAmount,
  shortenAddress
} from '@/lib/web3';
import { 
  DEFAULT_LISTING_DURATION_OPTIONS, 
  PAYMENT_OPTIONS, 
  MARKETPLACE_ADDRESS 
} from '@/lib/constants';
import { WalletState, TokenListingParams } from '@/lib/types';
import { toast } from 'sonner';
import { ListPlus, AlertCircle } from 'lucide-react';

export default function ListToken() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    provider: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });
  
  const [formData, setFormData] = useState<TokenListingParams>({
    tokenAddress: '',
    amount: '',
    pricePerShare: '',
    paymentToken: PAYMENT_OPTIONS[0].address,
    referralActive: false,
    referralPercent: '5',
    metadata: {
      projectWebsite: '',
      socialMediaLink: '',
      tokenImageUrl: '',
      telegramUrl: '',
      projectDescription: '',
    },
    durationInSeconds: DEFAULT_LISTING_DURATION_OPTIONS[1].value,
  });
  
  const [tokenInfo, setTokenInfo] = useState<{
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
  } | null>(null);
  
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  
  // Handler for detecting wallet connection from ConnectWallet component
  const onWalletConnected = (state: WalletState) => {
    setWalletState(state);
  };
  
  // Handler for form input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Handler for switch toggle
  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      referralActive: checked,
    }));
  };
  
  // Handler for select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Function to verify token and get its info
  const verifyToken = async () => {
    if (!walletState.provider || !walletState.address || !formData.tokenAddress) {
      toast.error('Please connect your wallet and enter a token address');
      return;
    }
    
    setIsLoadingToken(true);
    
    try {
      const tokenContract = getERC20Contract(formData.tokenAddress, walletState.provider);
      
      const [name, symbol, decimals, balance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.balanceOf(walletState.address),
      ]);
      
      setTokenInfo({
        name,
        symbol,
        decimals,
        balance: ethers.utils.formatUnits(balance, decimals),
      });
      
      toast.success(`Token verified: ${name} (${symbol})`);
    } catch (error: any) {
      console.error('Error verifying token:', error);
      toast.error(`Failed to verify token: ${error.message || 'Unknown error'}`);
      setTokenInfo(null);
    } finally {
      setIsLoadingToken(false);
    }
  };
  
  // Function to use max balance
  const handleUseMaxBalance = () => {
    if (tokenInfo && tokenInfo.balance) {
      setFormData(prev => ({
        ...prev,
        amount: tokenInfo.balance,
      }));
    }
  };
  
  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!walletState.provider || !walletState.address) {
      toast.error('Please connect your wallet');
      return;
    }
    
    if (!tokenInfo) {
      toast.error('Please verify the token first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format amounts with proper decimals
      const amount = ethers.utils.parseUnits(formData.amount, tokenInfo.decimals).toString();
      const pricePerShare = ethers.utils.parseUnits(
        formData.pricePerShare,
        PAYMENT_OPTIONS.find(opt => opt.address === formData.paymentToken)?.decimals || 18
      ).toString();
      
      // Check if the token allowance is sufficient
      const hasAllowance = await checkAllowance(
        formData.tokenAddress,
        walletState.address,
        MARKETPLACE_ADDRESS,
        amount,
        walletState.provider
      );
      
      // If allowance is not enough, approve the tokens
      if (!hasAllowance) {
        toast.info('Approving tokens for marketplace...');
        const approved = await approveTokens(
          formData.tokenAddress,
          MARKETPLACE_ADDRESS,
          amount,
          walletState.provider
        );
        
        if (!approved) {
          throw new Error('Token approval failed');
        }
        
        toast.success('Token approved successfully');
      }
      
      // Get marketplace contract
      const marketplaceContract = getMarketplaceContract(walletState.provider);
      
      // Convert referral percent to number
      const referralPercent = formData.referralActive 
        ? ethers.BigNumber.from(formData.referralPercent)
        : ethers.BigNumber.from(0);
      
      // List the token
      const tx = await marketplaceContract.listToken(
        formData.tokenAddress,
        amount,
        pricePerShare,
        formData.paymentToken,
        formData.referralActive,
        referralPercent,
        [
          formData.metadata.projectWebsite,
          formData.metadata.socialMediaLink,
          formData.metadata.tokenImageUrl,
          formData.metadata.telegramUrl,
          formData.metadata.projectDescription,
        ],
        formData.durationInSeconds
      );
      
      toast.info('Listing token in progress...');
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      toast.success('Token listed successfully!');
      
      // Navigate to the marketplace
      navigate('/marketplace');
    } catch (error: any) {
      console.error('Error listing token:', error);
      toast.error(`Failed to list token: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">List Token Manually</h1>
              <p className="text-muted-foreground mt-1">
                List your ERC20 token on the marketplace for others to purchase
              </p>
            </div>
            
            <ConnectWallet onConnect={onWalletConnected} />
          </div>
          
          <Card className="max-w-3xl mx-auto border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListPlus className="h-5 w-5" />
                List Token for Sale
              </CardTitle>
              <CardDescription>
                Enter the details of the token you want to list on the marketplace
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tokenAddress">Token Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tokenAddress"
                          name="tokenAddress"
                          placeholder="0x..."
                          value={formData.tokenAddress}
                          onChange={handleChange}
                          disabled={isSubmitting || isLoadingToken}
                          required
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={verifyToken}
                          disabled={!walletState.address || !formData.tokenAddress || isLoadingToken}
                        >
                          {isLoadingToken ? <LoadingSpinner size="sm" /> : 'Verify'}
                        </Button>
                      </div>
                    </div>
                    
                    {tokenInfo && (
                      <div className="bg-muted/50 rounded-md p-4 flex flex-col justify-center">
                        <p className="text-sm font-medium">{tokenInfo.name} ({tokenInfo.symbol})</p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {parseFloat(tokenInfo.balance).toFixed(4)} {tokenInfo.symbol}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount to List</Label>
                      <div className="flex gap-2">
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="any"
                          placeholder="0.0"
                          value={formData.amount}
                          onChange={handleChange}
                          disabled={isSubmitting || !tokenInfo}
                          required
                        />
                        {tokenInfo && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleUseMaxBalance}
                            disabled={isSubmitting}
                            className="whitespace-nowrap"
                          >
                            Max
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pricePerShare">Price Per Token</Label>
                      <div className="flex gap-2">
                        <Input
                          id="pricePerShare"
                          name="pricePerShare"
                          type="number"
                          step="any"
                          placeholder="0.0"
                          value={formData.pricePerShare}
                          onChange={handleChange}
                          disabled={isSubmitting || !tokenInfo}
                          required
                        />
                        
                        <Select
                          value={formData.paymentToken}
                          onValueChange={(value) => handleSelectChange('paymentToken', value)}
                          disabled={isSubmitting || !tokenInfo}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_OPTIONS.map((option) => (
                              <SelectItem key={option.address} value={option.address}>
                                {option.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationInSeconds">Listing Duration</Label>
                    <Select
                      value={formData.durationInSeconds.toString()}
                      onValueChange={(value) => handleSelectChange('durationInSeconds', value)}
                      disabled={isSubmitting || !tokenInfo}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_LISTING_DURATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="referralActive"
                      checked={formData.referralActive}
                      onCheckedChange={handleToggleChange}
                      disabled={isSubmitting || !tokenInfo}
                    />
                    <Label htmlFor="referralActive">Enable Referral Rewards</Label>
                  </div>
                  
                  {formData.referralActive && (
                    <div className="space-y-2">
                      <Label htmlFor="referralPercent">Referral Percent</Label>
                      <Input
                        id="referralPercent"
                        name="referralPercent"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.referralPercent}
                        onChange={handleChange}
                        disabled={isSubmitting || !tokenInfo}
                        required={formData.referralActive}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="metadata.tokenImageUrl">Token Image URL</Label>
                    <Input
                      id="metadata.tokenImageUrl"
                      name="metadata.tokenImageUrl"
                      placeholder="https://..."
                      value={formData.metadata.tokenImageUrl}
                      onChange={handleChange}
                      disabled={isSubmitting || !tokenInfo}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metadata.projectDescription">Project Description</Label>
                    <Textarea
                      id="metadata.projectDescription"
                      name="metadata.projectDescription"
                      placeholder="Describe your token or project..."
                      value={formData.metadata.projectDescription}
                      onChange={handleChange}
                      disabled={isSubmitting || !tokenInfo}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="metadata.projectWebsite">Project Website</Label>
                      <Input
                        id="metadata.projectWebsite"
                        name="metadata.projectWebsite"
                        placeholder="https://..."
                        value={formData.metadata.projectWebsite}
                        onChange={handleChange}
                        disabled={isSubmitting || !tokenInfo}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="metadata.socialMediaLink">Social Media Link</Label>
                      <Input
                        id="metadata.socialMediaLink"
                        name="metadata.socialMediaLink"
                        placeholder="https://..."
                        value={formData.metadata.socialMediaLink}
                        onChange={handleChange}
                        disabled={isSubmitting || !tokenInfo}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metadata.telegramUrl">Telegram URL</Label>
                    <Input
                      id="metadata.telegramUrl"
                      name="metadata.telegramUrl"
                      placeholder="https://t.me/..."
                      value={formData.metadata.telegramUrl}
                      onChange={handleChange}
                      disabled={isSubmitting || !tokenInfo}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              {!walletState.address && (
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 w-full p-3 rounded-md text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connect your wallet to list a token</span>
                </div>
              )}
              
              <Button 
                className="w-full"
                type="submit"
                onClick={handleSubmit}
                disabled={
                  isSubmitting || 
                  !walletState.address || 
                  !tokenInfo || 
                  !formData.amount || 
                  !formData.pricePerShare
                }
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'List Token'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
