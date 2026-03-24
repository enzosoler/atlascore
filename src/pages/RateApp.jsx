import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RateApp() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-[hsl(var(--fg-2))] mb-6">Your feedback helps us improve Atlas Core.</p>
          <Button onClick={() => navigate('/today')}>Continue</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[hsl(var(--bg))] rounded-2xl max-w-sm w-full p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--accent-primary))]/10 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Enjoying Atlas Core?</h2>
          <p className="text-sm text-[hsl(var(--fg-2))]">Rate your experience</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-[hsl(var(--border))]'
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more (optional)..."
              className="w-full h-24 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                <X className="w-4 h-4 mr-2" />
                Not Now
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
