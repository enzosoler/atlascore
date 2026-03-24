import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CONTACT_METHODS = [
  { id: 'chat', icon: MessageSquare, label: 'Live Chat', desc: 'Typically responds in 5 min', available: true },
  { id: 'email', icon: Mail, label: 'Email', desc: 'Typically responds in 24 hours', available: true },
  { id: 'phone', icon: Phone, label: 'Phone', desc: 'Mon-Fri 9am-5pm EST', available: false },
];

export default function ContactSupport() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('chat');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Contact Support</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
              <p className="text-[hsl(var(--fg-2))] mb-6">
                We'll get back to you as soon as possible.
              </p>
              <Button onClick={() => navigate('/settings')}>
                Back to Settings
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {CONTACT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => method.available && setSelectedMethod(method.id)}
                    disabled={!method.available}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-colors ${
                      selectedMethod === method.id
                        ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                        : method.available
                        ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--fill))] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-[hsl(var(--accent-primary))]' : ''}`} />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-[hsl(var(--fg-2))]">{method.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full h-32 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                  />
                </div>
                <Button onClick={handleSubmit} disabled={!message.trim()} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
