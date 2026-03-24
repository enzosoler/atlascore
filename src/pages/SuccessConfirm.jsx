import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export default function SuccessConfirm({
  message = 'Success!',
  description,
  onClose,
  autoClose = 3000,
}) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50"
    >
      <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
