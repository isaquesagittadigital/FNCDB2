import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Loader2 } from 'lucide-react';

interface RenewalConfirmModalProps {
    open: boolean;
    contract: any;
    onClose: () => void;
    onSuccess: () => void;
}

const RenewalConfirmModal: React.FC<RenewalConfirmModalProps> = ({
    open,
    contract,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    if (!open || !contract) return null;

    const today = new Date().toLocaleDateString('pt-BR');

    // Robustly extract rate from multiple possible fields
    const taxa = (contract.taxaMensal
        ?? contract.taxa_mensal
        ?? parseFloat(String(contract.yield ?? '0').replace('%', '').replace(',', '.')))
        || 0;

    // Robustly extract amount from multiple possible fields
    const valorAporte = (Number(contract.valor_aporte)
        || Number(contract.valor)
        || parseFloat(String(contract.amount ?? '0').replace('R$', '').replace(/\./g, '').replace(',', '.').trim()))
        || 0;

    // Use pre-formatted string if available, otherwise format
    const valorFormatado = contract.valor_formatado
        || contract.amount
        || new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAporte);

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const contractId = contract.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}/renewal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || 'Erro ao enviar solicitação de renovação.');
                return;
            }

            onSuccess();
        } catch (err) {
            console.error('Erro ao solicitar renovação:', err);
            alert('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
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
                    className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 space-y-6"
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon */}
                    <div className="w-14 h-14 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-[#00A3B1]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#002B49] text-center leading-snug">
                        Deseja confirmar a solicitação de renovação deste contrato?
                    </h3>

                    {/* Info */}
                    <div className="space-y-2 text-sm text-slate-600">
                        <p>
                            <span className="text-slate-400">Data da solicitação:</span>{' '}
                            <span className="font-medium text-[#002B49]">{today}</span>
                        </p>
                        <p>
                            <span className="text-slate-400">Taxa de remuneração:</span>{' '}
                            <span className="font-medium text-[#002B49]">{taxa}%</span>
                        </p>
                        <p>
                            <span className="text-slate-400">Valor do contrato:</span>{' '}
                            <span className="font-bold text-[#002B49]">{valorFormatado}</span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3.5 bg-[#00A3B1] hover:bg-[#008c99] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#00A3B1]/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                            ) : (
                                'Enviar'
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-60"
                        >
                            Cancelar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RenewalConfirmModal;
