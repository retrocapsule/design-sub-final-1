import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 md:px-6 border-t bg-white">
      <div className="container mx-auto max-w-6xl"> { /* Increased max-width slightly for potential extra column */ }
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            { /* Consider making the logo a link to home */ }
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">DesignSub</h2>
            </Link>
            <p className="text-slate-600 mt-2">Unlimited designs for creators who want to make their mark.</p>
            {/* Optional: Add social media icons here */}
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16">
            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-slate-600 hover:text-primary transition-colors text-sm">About</Link></li>
                <li><Link href="/pricing" className="text-slate-600 hover:text-primary transition-colors text-sm">Pricing</Link></li>
                <li><Link href="/contact" className="text-slate-600 hover:text-primary transition-colors text-sm">Contact</Link></li>
                {/* Add other relevant company links: Blog, Careers, etc. */}
              </ul>
            </div>
            {/* Industries Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Industries</h3>
              <ul className="space-y-2">
                <li><Link href="/for/clothing-brands" className="text-slate-600 hover:text-primary transition-colors text-sm">Clothing Brands</Link></li>
                <li><Link href="/for/music-artists" className="text-slate-600 hover:text-primary transition-colors text-sm">Music Artists</Link></li>
                <li><Link href="/for/hemp-brands" className="text-slate-600 hover:text-primary transition-colors text-sm">Cannabis Brands</Link></li>
              </ul>
            </div>
            {/* Legal Links */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-slate-600 hover:text-primary transition-colors text-sm">Terms</Link></li>
                <li><Link href="/privacy" className="text-slate-600 hover:text-primary transition-colors text-sm">Privacy</Link></li>
                 {/* Add Cookie Policy if applicable */}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t mt-10 pt-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} DesignSub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 