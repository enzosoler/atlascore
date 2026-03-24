import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Clock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OFFERS = [
  { code: 'SAVE50', discount: '50% OFF', desc: 'First month only', timeLeft: '2 hours' },
  { code: 'ANNUAL30', discount: '30% OFF', desc: 'Annual plan', timeLeft: '24 hours' },
  { code: 'WELCOME20', discount: '20% OFF', desc: 'Any plan', timeLeft: '7 days' },
];

export default function DiscountScreen() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 p-3 rounded-full bg-[hsl(var(--accent-primary))]/10 mb-4">
              <Tag className="w-6 h-6 text-[hsl(var(--accent-primary))]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Special Offers</h1>
            <p className="text-[hsl(var(--fg-2))]">
              Limited time discounts for you
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {OFFERS.map((offer) => (
              <div 
                key={offer.code}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[hsl(var(--accent-primary))] text-white text-xs px-2 py-1 rounded-bl-lg">
                  {offer.discount}
                </div>
                <p className="font-medium text-lg">{offer.code}</p>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-3">{offer.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[hsl(var(--fg-3))]">
                    <Clock className="w-3 h-3" />
                    Expires in {offer.timeLeft}
                  </div>
                  <button
                    onClick={() => copyCode(offer.code)}
                    className="flex items-center gap-1 text-sm text-[hsl(var(--accent-primary))] hover:underline"
                  >
                    {copied === offer.code ? (
                      <><Check className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/pricing')} className="w-full">
            Apply Code & Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
