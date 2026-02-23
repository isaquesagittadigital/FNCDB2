
import React from 'react';
import { motion } from 'framer-motion';
import { Send, X, RotateCcw } from 'lucide-react';

interface SendContractConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

const SendContractConfirmationModal: React.FC<SendContractConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    loading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
                {/* Icon */}
                <div className="w-20 h-20 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6F6F7]/50">
                    <Send className="text-[#00A3B1]" size={36} />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#002B49]">Deseja realmente enviar este contrato?</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                        Ao confirmar, o contrato será enviado para a assinatura digital. Deseja prosseguir?
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <RotateCcw size={18} className="animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            'Confirmar Contrato'
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-[#002B49] font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SendContractConfirmationModal;
