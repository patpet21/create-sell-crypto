
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { toast } from 'sonner';
import { TokenCreationParams, TransactionState } from '@/lib/types';
import { connectWallet, getTokenCreatorContract, getTxExplorerUrl } from '@/lib/web3';
import { AlertCircle } from 'lucide-react';

export default function CreateToken() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TokenCreationParams>({
    tokenName: '',
    tokenSymbol: '',
    initialSupply: '',
    imageLink: '',
    projectDesc: '',
    websiteLink: '',
    twitterLink: '',
    telegramLink: '',
  });
  
  const [transaction, setTransaction] = useState<TransactionState>({
    hash: null,
    status: 'idle',
    error: null,
  });
  
  const [walletConnected, setWalletConnected] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.tokenName || !formData.tokenSymbol || !formData.initialSupply || !formData.imageLink || !formData.projectDesc) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Validate token symbol (3-5 characters, uppercase)
    const symbolRegex = /^[A-Z0-9]{3,5}$/;
    if (!symbolRegex.test(formData.tokenSymbol)) {
      toast.error('Token symbol must be 3-5 uppercase characters');
      return;
    }
    
    // Validate initial supply (numeric and positive)
    const supplyValue = parseFloat(formData.initialSupply);
    if (isNaN(supplyValue) || supplyValue <= 0) {
      toast.error('Initial supply must be a positive number');
      return;
    }
    
    try {
      setTransaction({ hash: null, status: 'pending', error: null });
      
      // Connect wallet
      const provider = await connectWallet();
      if (!provider) {
        setTransaction({ hash: null, status: 'error', error: 'Failed to connect wallet' });
        return;
      }
      
      setWalletConnected(true);
      
      // Get contract instance
      const tokenCreatorContract = getTokenCreatorContract(provider);
      
      // Format initial supply to have 18 decimals
      const initialSupply = formData.initialSupply;
      
      // Submit transaction
      const tx = await tokenCreatorContract.createToken(
        formData.tokenName,
        formData.tokenSymbol,
        initialSupply,
        formData.imageLink,
        formData.projectDesc,
        formData.websiteLink || '',
        formData.twitterLink || '',
        formData.telegramLink || ''
      );
      
      setTransaction({ hash: tx.hash, status: 'pending', error: null });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Extract token address from event logs
      let tokenAddress = '';
      if (receipt.events) {
        const tokenCreatedEvent = receipt.events.find((e: any) => e.event === 'TokenCreated');
        if (tokenCreatedEvent && tokenCreatedEvent.args) {
          tokenAddress = tokenCreatedEvent.args[0];
        }
      }
      
      setTransaction({ hash: tx.hash, status: 'success', error: null });
      toast.success('Token created successfully!');
      
      // Navigate to token details page or marketplace
      if (tokenAddress) {
        navigate(`/token/${tokenAddress}`);
      } else {
        navigate('/marketplace');
      }
    } catch (error: any) {
      console.error('Token creation error:', error);
      setTransaction({ 
        hash: null, 
        status: 'error', 
        error: error.message || 'Failed to create token' 
      });
      toast.error(`Error: ${error.message || 'Failed to create token'}`);
    }
  };
  
  const isSubmitting = transaction.status === 'pending';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create Your Token</h1>
            <p className="text-muted-foreground mt-2">Launch your own custom token on the Base blockchain</p>
          </div>
          
          <Card className="border border-border/40">
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
              <CardDescription>
                Fill in the details below to create your custom token.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tokenName">Token Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="tokenName"
                      name="tokenName"
                      placeholder="e.g. My Property Token"
                      value={formData.tokenName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tokenSymbol">Token Symbol <span className="text-red-500">*</span></Label>
                    <Input
                      id="tokenSymbol"
                      name="tokenSymbol"
                      placeholder="e.g. MPT"
                      value={formData.tokenSymbol}
                      onChange={handleInputChange}
                      required
                      maxLength={5}
                      className="uppercase"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">3-5 uppercase characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="initialSupply">Initial Supply <span className="text-red-500">*</span></Label>
                    <Input
                      id="initialSupply"
                      name="initialSupply"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 1000000"
                      value={formData.initialSupply}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageLink">Token Image URL <span className="text-red-500">*</span></Label>
                    <Input
                      id="imageLink"
                      name="imageLink"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageLink}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectDesc">Project Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="projectDesc"
                    name="projectDesc"
                    placeholder="Describe your token and its purpose"
                    value={formData.projectDesc}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Maximum 1000 characters</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="websiteLink">Website URL</Label>
                    <Input
                      id="websiteLink"
                      name="websiteLink"
                      placeholder="https://example.com"
                      value={formData.websiteLink}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitterLink">Twitter URL</Label>
                    <Input
                      id="twitterLink"
                      name="twitterLink"
                      placeholder="https://twitter.com/username"
                      value={formData.twitterLink}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telegramLink">Telegram URL</Label>
                  <Input
                    id="telegramLink"
                    name="telegramLink"
                    placeholder="https://t.me/username"
                    value={formData.telegramLink}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </div>
                
                {transaction.status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {transaction.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {transaction.status === 'success' && (
                  <Alert>
                    <AlertDescription>
                      Transaction successful! 
                      {transaction.hash && (
                        <a 
                          href={getTxExplorerUrl(transaction.hash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 underline hover:text-primary"
                        >
                          View on explorer
                        </a>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full group relative overflow-hidden"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Create Token</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
