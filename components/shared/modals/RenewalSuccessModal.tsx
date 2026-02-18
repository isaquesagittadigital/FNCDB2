import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface RenewalSuccessModalProps {
    open: boolean;
    valorFormatado: string;
    onClose: () => void;
}

const RenewalSuccessModal: React.FC<RenewalSuccessModalProps> = ({
    open,
    valorFormatado,
    onClose,
}) => {
    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                    className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 space-y-5"
                >
                    {/* Icon */}
                    <div className="w-16 h-16 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={36} className="text-[#00A3B1]" />
                    </div>

                    {/* Message */}
                    <p className="text-center text-[#002B49] text-sm leading-relaxed">
                        A solicitação de renovação foi encaminhada para análise, e o valor do contrato é{' '}
                        <strong>{valorFormatado}</strong> em breve, nosso time vai encaminhar um e-mail para finalizar este pedido.
                    </p>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-[#00A3B1] hover:bg-[#008c99] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#00A3B1]/20"
                    >
                        Fechar
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RenewalSuccessModal;
