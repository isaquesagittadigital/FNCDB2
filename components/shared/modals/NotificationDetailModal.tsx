
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#002B49]/20 backdrop-blur-[2px]"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-[#E6F6F7] rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-[#B2E7EC] rounded-full flex items-center justify-center">
                <Mail className="text-[#00A3B1]" size={20} />
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Text content */}
          <div className="space-y-2 mb-10">
            <h3 className="text-lg font-bold text-[#002B49] leading-tight">
              {notification.title}
            </h3>
            <p className="text-sm text-[#64748B] font-medium leading-relaxed">
              {notification.content}
            </p>
          </div>

          {/* Bottom Button */}
          <button 
            onClick={onClose}
            className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#00A3B1]/20 active:scale-[0.98]"
          >
            Fechar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationDetailModal;
