
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title = "Dados atualizados",
    description = "Dados do cliente atualizados com sucesso.",
    buttonText = "Fechar"
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[#E6F6F7] text-[#00A3B1] rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 className="text-lg font-bold text-[#002B49] mb-2">{title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            {description}
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
                        >
                            {buttonText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SuccessModal;
