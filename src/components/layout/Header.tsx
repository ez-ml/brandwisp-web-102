import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              BrandWisp
            </Link>
            <nav className="hidden md:flex ml-8 gap-6">
              <Link 
                href="/stores" 
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Stores
              </Link>
              <Link 
                href="/features" 
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/blog" 
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 