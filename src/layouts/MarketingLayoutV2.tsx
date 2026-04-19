import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles, Globe, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { ROUTES } from '@/lib/routes';

interface MarketingLayoutProps {
  children: ReactNode;
  transparentHeader?: boolean;
}

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: ROUTES.pricing },
  { label: 'Blog', href: ROUTES.blog },
  { label: 'Company', href: '/about' },
];

export default function MarketingLayoutV2({ children, transparentHeader = false }: MarketingLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Sticky Header */}
      <header 
        className={cn(
          "fixed top-0 inset-x-0 z-header transition-all duration-300 border-b",
          transparentHeader && !isMobileMenuOpen
            ? "bg-transparent border-transparent py-6"
            : "bg-background/80 backdrop-blur-xl border-border/50 py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <AtlasCoreLogoSVG width={32} />
            <span className="text-xl font-bold tracking-tight group-hover:opacity-80 transition-opacity">
              atlas<span className="text-primary">.core</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to={ROUTES.auth} className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link 
              to={ROUTES.auth} 
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-modal bg-background pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-bold hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border/50" />
              <Link to={ROUTES.auth} className="text-xl font-medium">Sign In</Link>
              <Link 
                to={ROUTES.auth} 
                className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary text-primary-foreground font-bold"
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <AtlasCoreLogoSVG width={32} />
                <span className="text-xl font-bold tracking-tight">
                  atlas<span className="text-primary">.core</span>
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm mb-8">
                The high-performance OS for your physical potential. Precision tracking, AI insights, and professional protocols.
              </p>
              <div className="flex gap-4">
                 {/* Social links placeholders */}
                 {[Globe, Shield, Zap].map((Icon, i) => (
                   <div key={i} className="w-10 h-10 rounded-full bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 cursor-pointer transition-all">
                      <Icon className="w-5 h-5" />
                   </div>
                 ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/#features" className="hover:text-primary">Features</Link></li>
                <li><Link to={ROUTES.pricing} className="hover:text-primary">Pricing</Link></li>
                <li><Link to="/app" className="hover:text-primary">Mobile App</Link></li>
                <li><Link to="/enterprise" className="hover:text-primary">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to={ROUTES.blog} className="hover:text-primary">Blog</Link></li>
                <li><Link to="/help" className="hover:text-primary">Help Center</Link></li>
                <li><Link to="/community" className="hover:text-primary">Community</Link></li>
                <li><Link to="/status" className="hover:text-primary">System Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Atlas Core Technologies Inc. Made with passion for performance.</p>
            <div className="flex gap-8">
              <span>English (US)</span>
              <span>USD ($)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
