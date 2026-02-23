import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export interface FeedbackModalData {
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
}

interface FeedbackModalProps {
    data: FeedbackModalData | null;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ data, onClose }) => {
    if (!data) return null;

    const config = {
        success: {
            icon: CheckCircle2,
            bg: 'bg-emerald-50',
            ring: 'ring-emerald-100',
            iconColor: 'text-emerald-500',
            btnBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
        },
        error: {
            icon: XCircle,
            bg: 'bg-red-50',
            ring: 'ring-red-100',
            iconColor: 'text-red-500',
            btnBg: 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-50',
            ring: 'ring-amber-100',
            iconColor: 'text-amber-500',
            btnBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
        },
    }[data.type];

    const Icon = config.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
                >
                    <button onClick={onClose} className="absolute right-5 top-5 text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={18} />
                    </button>
                    <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mx-auto ring-8 ${config.ring}`}>
                        <Icon className={config.iconColor} size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-[#002B49]">{data.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{data.message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${config.btnBg}`}
                    >
                        Entendido
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FeedbackModal;
