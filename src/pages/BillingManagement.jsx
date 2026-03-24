import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Receipt, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingManagement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Billing</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Method
            </h2>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--fill))]">
              <div className="w-10 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded" />
              <div>
                <p className="font-medium text-sm">•••• 4242</p>
                <p className="text-xs text-[hsl(var(--fg-2))]">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3 text-sm">
              Update Payment Method
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Billing History
            </h2>
            <div className="space-y-3">
              {[
                { date: 'Jan 1, 2024', amount: '$9.99', status: 'Paid' },
                { date: 'Dec 1, 2023', amount: '$9.99', status: 'Paid' },
                { date: 'Nov 1, 2023', amount: '$9.99', status: 'Paid' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--fill))]">
                  <div>
                    <p className="text-sm font-medium">{invoice.date}</p>
                    <p className="text-xs text-[hsl(var(--fg-2))]">{invoice.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{invoice.amount}</span>
                    <button className="p-1 hover:bg-[hsl(var(--fill))] rounded">
                      <ExternalLink className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
