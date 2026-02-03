
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative p-8 text-center"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#E6F7F2] text-[#00B171] rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-[#E6F7F2]/50">
                            <CheckCircle2 size={42} strokeWidth={2.5} />
                        </div>

                        <h3 className="text-2xl font-bold text-[#002B49] mb-3">
                            {title}
                        </h3>

                        <p className="text-slate-500 leading-relaxed mb-8">
                            {message}
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full bg-[#009BB6] hover:bg-[#008f9e] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#009BB6]/20 active:scale-95"
                        >
                            OK, entendi
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SuccessModal;
