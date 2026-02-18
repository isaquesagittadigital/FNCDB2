import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Loader2 } from 'lucide-react';

interface RedeemRequestModalProps {
    open: boolean;
    contract: any;
    onClose: () => void;
    onSuccess: () => void;
}

const RedeemRequestModal: React.FC<RedeemRequestModalProps> = ({
    open,
    contract,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [redeemFull, setRedeemFull] = useState(false);
    const [rawValue, setRawValue] = useState('');

    // Get total contract value
    const valorAporte = (Number(contract?.valor_aporte)
        || Number(contract?.valor)
        || parseFloat(String(contract?.amount ?? '0').replace('R$', '').replace(/\./g, '').replace(',', '.').trim()))
        || 0;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // When toggle changes, set value accordingly
    useEffect(() => {
        if (redeemFull) {
            setRawValue(formatInputValue(valorAporte));
        } else {
            setRawValue('');
        }
    }, [redeemFull]);

    if (!open || !contract) return null;

    // Format input value as currency (only numbers)
    function formatInputValue(value: number | string): string {
        const num = typeof value === 'number'
            ? value
            : parseFloat(String(value).replace(/\D/g, '')) / 100;
        if (!num && num !== 0) return '';
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
        const digits = e.target.value.replace(/\D/g, '');
        if (!digits) {
            setRawValue('');
            return;
        }
        const num = parseFloat(digits) / 100;
        setRawValue(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

    function getNumericValue(): number {
        if (!rawValue) return 0;
        return parseFloat(rawValue.replace(/\./g, '').replace(',', '.')) || 0;
    }

    const handleSubmit = async () => {
        const valor = getNumericValue();

        if (valor <= 0) {
            alert('Informe um valor válido para o resgate.');
            return;
        }

        if (valor > valorAporte) {
            alert('O valor do resgate não pode ser maior que o valor do contrato.');
            return;
        }

        setLoading(true);
        try {
            const contractId = contract.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    valor_resgate: valor,
                    resgate_integral: redeemFull,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || 'Erro ao enviar solicitação de resgate.');
                return;
            }

            onSuccess();
        } catch (err) {
            console.error('Erro ao solicitar resgate:', err);
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
                    className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-7 space-y-5"
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon */}
                    <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center">
                        <CheckCircle2 size={28} className="text-[#00A3B1]" />
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                        <h3 className="text-base font-bold text-[#002B49] leading-snug">
                            Informe o valor para a solicitação de resgate.
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Digite o valor do resgate abaixo.
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setRedeemFull(!redeemFull)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${redeemFull ? 'bg-[#00A3B1]' : 'bg-slate-200'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${redeemFull ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <span className="text-sm text-slate-600 font-medium">
                            Deseja resgatar o valor integral?
                        </span>
                    </div>

                    {/* Input */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                            Digite o valor do resgate
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                R$
                            </span>
                            <input
                                type="text"
                                value={rawValue}
                                onChange={handleValueChange}
                                disabled={redeemFull}
                                placeholder="0,00"
                                className={`w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all placeholder:text-slate-300 ${redeemFull ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || getNumericValue() <= 0}
                        className="w-full py-3.5 bg-[#00A3B1] hover:bg-[#008c99] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#00A3B1]/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                        ) : (
                            'Enviar solicitação'
                        )}
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RedeemRequestModal;
