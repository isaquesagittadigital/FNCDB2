import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Clock, Calendar, DollarSign, FileText, Wallet } from 'lucide-react';

interface RedeemData {
    id: string;
    status: string;
    data_solicitacao: string;
    data_aprovacao?: string | null;
    data_pagamento?: string | null;
    valor_resgate: number;
    tipo_resgate: string; // 'Integral' | 'Parcial'
    contrato_id: string;
}

interface RedeemViewModalProps {
    open: boolean;
    redeem: RedeemData | null;
    contractCode: string;
    contractValue: number; // Para mostrar contexto se necessário, ou apenas usar o valor do resgate
    onClose: () => void;
}

const RedeemViewModal: React.FC<RedeemViewModalProps> = ({
    open,
    redeem,
    contractCode,
    contractValue,
    onClose,
}) => {
    if (!open || !redeem) return null;

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (value: number | undefined) => {
        if (!value && value !== 0) return '—';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pendente':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Aprovado':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Pago':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Recusado':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const infoRows = [
        {
            icon: <FileText size={16} />,
            label: 'Código do contrato',
            value: contractCode,
        },
        {
            icon: <Clock size={16} />,
            label: 'Data da solicitação',
            value: formatDate(redeem.data_solicitacao),
        },
        {
            icon: <Wallet size={16} />,
            label: 'Tipo de resgate',
            value: redeem.tipo_resgate || '—',
        },
        {
            icon: <DollarSign size={16} />,
            label: 'Valor solicitado',
            value: formatCurrency(redeem.valor_resgate),
        },
        {
            icon: <Calendar size={16} />,
            label: 'Data prevista pagamento',
            value: redeem.data_pagamento ? formatDate(redeem.data_pagamento) : 'Em análise',
        },
    ];

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
                    className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                <Eye size={20} className="text-[#009CA3]" />
                            </div>
                            <div>
                                <h3 className="text-[#002B49] font-bold text-sm">Solicitação de Resgate</h3>
                                <p className="text-[#009CA3] text-xs font-medium mt-0.5">Código: {contractCode}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="px-6 pt-5 pb-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">Status da solicitação</span>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(redeem.status)}`}>
                                {redeem.status}
                            </span>
                        </div>
                    </div>

                    {/* Info Rows */}
                    <div className="px-6 pb-6">
                        <div className="space-y-0 divide-y divide-slate-100">
                            {infoRows.map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        {row.icon}
                                        <span className="text-xs">{row.label}</span>
                                    </div>
                                    <span className={`text-xs font-semibold max-w-[200px] text-right truncate ${row.label === 'Valor solicitado' ? 'text-emerald-600' : 'text-[#002B49]'
                                        }`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-[#00A3B1] hover:bg-[#008c99] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#00A3B1]/20"
                        >
                            Fechar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RedeemViewModal;
