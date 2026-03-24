import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Check, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);

  const handlePayment = () => {
    setStep(3);
    setTimeout(() => navigate('/today'), 2000);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Checkout</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-[hsl(var(--fg-2))]">Atlas Core Premium</span>
                  <span>$9.99/mo</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-[hsl(var(--border))]">
                  <span>Total</span>
                  <span>$9.99</span>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">Continue to Payment</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  <span className="font-medium">Payment Method</span>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="w-full p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))]"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="flex-1 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))]"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="w-24 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--fg-2))]">
                <Lock className="w-4 h-4" />
                <span>Payments are secure and encrypted</span>
              </div>
              <Button onClick={handlePayment} className="w-full">Pay $9.99</Button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-[hsl(var(--fg-2))] mb-6">Welcome to Atlas Core Premium</p>
              <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--fg-3))]">
                <ShieldCheck className="w-4 h-4" />
                <span>Redirecting to app...</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
