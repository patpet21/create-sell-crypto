
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto py-6 md:py-8 border-t border-border/40 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/create" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Create Token
            </Link>
            <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
