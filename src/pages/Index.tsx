
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
          <div 
            className={cn(
              "container mx-auto px-4 md:px-6 relative transition-all duration-700 ease-out",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Create and Trade Tokens on the{' '}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  {APP_NAME} Platform
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Launch your own token with just a few clicks and trade in our decentralized marketplace on Base.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden"
                  asChild
                >
                  <Link to="/create">
                    <span className="relative z-10">Create Token</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group"
                  asChild
                >
                  <Link to="/marketplace">
                    <span>Browse Marketplace</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-secondary/50">
          <div 
            className={cn(
              "container mx-auto px-4 md:px-6 transition-all duration-700 ease-out delay-150",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Platform Features</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Everything you need to create and trade tokens on the Base blockchain
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "bg-white rounded-xl p-6 shadow-sm border border-border/40 transition-all duration-500 ease-out hover:shadow-md",
                    isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                    { "delay-200": index === 0, "delay-300": index === 1, "delay-400": index === 2 }
                  )}
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
          <div 
            className={cn(
              "container mx-auto px-4 md:px-6 relative transition-all duration-700 ease-out delay-300",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="max-w-4xl mx-auto text-center space-y-6 py-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Ready to Begin Your Token Journey?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start creating your token now or explore the marketplace to discover assets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden"
                  asChild
                >
                  <Link to="/create">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

const features = [
  {
    title: 'Create Custom Tokens',
    description: 'Design and deploy your own ERC-20 tokens with customizable properties in minutes.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Decentralized Marketplace',
    description: 'List and trade tokens with flexible pricing and payment options on our secure platform.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    title: 'Referral System',
    description: 'Earn rewards by referring users to token listings with our built-in referral program.',
    icon: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
];
