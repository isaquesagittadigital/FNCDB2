import React, { useState } from 'react';
import { Check, X, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    paymentInfo: {
        name: string;
        amount: number;
    } | null;
    isLoading?: boolean;
}

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({ isOpen, onClose, onConfirm, paymentInfo, isLoading }) => {
    if (!isOpen || !paymentInfo) return null;

    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-hidden"
                        >
                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-[#009BB6]/10 rounded-full flex items-center justify-center">
                                    <Wallet className="w-8 h-8 text-[#009BB6]" />
                                </div>

                                <h3 className="text-xl font-bold text-[#002B49]">Deseja confirmar o pagamento?</h3>

                                <p className="text-sm text-slate-500">
                                    Pagamento - {paymentInfo.name} e {formatCurrency(paymentInfo.amount)}
                                </p>

                                <div className="flex gap-4 w-full mt-6">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-[#009BB6] text-white rounded-xl font-medium hover:bg-[#008299] transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isLoading ? 'Confirmando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmPaymentModal;
