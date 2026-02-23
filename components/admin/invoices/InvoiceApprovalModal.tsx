
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileText, Trash2, Eye, AlertCircle } from 'lucide-react';
import { Field, SelectField } from '../../shared/ui/FormElements';

interface InvoiceApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any;
    onApprove: (data: any) => Promise<void>;
}

const InvoiceApprovalModal: React.FC<InvoiceApprovalModalProps> = ({
    isOpen,
    onClose,
    invoice,
    onApprove
}) => {
    const [status, setStatus] = useState('Aprovada');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (invoice?.status === 'Rejeitada') {
            setStatus('Rejeitada');
            setRejectionReason(invoice.rejectionReason || '');
        } else {
            setStatus('Aprovada');
            setRejectionReason('');
        }
    }, [invoice]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onApprove({ status, rejectionReason });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    {/* Header - Fixed */}
                    <div className="p-8 pb-6 border-b border-slate-50 relative shrink-0 bg-[#F8FAFB]">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="absolute right-6 top-6 text-slate-400 hover:text-[#002B49] transition-colors p-1.5 bg-white rounded-full shadow-sm"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#B2E7EC]/40 rounded-xl flex items-center justify-center">
                                <FileText className="text-[#00A3B1]" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#002B49]">Análise da Nota</h3>
                                <p className="text-xs text-slate-400">Consultor: {invoice?.consultor}</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Data Display Section */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                                <div className="flex justify-between border-b border-slate-50 pb-4">
                                    <div className="space-y-1 text-left">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referência</p>
                                        <p className="text-sm font-bold text-[#002B49]">{invoice?.titulo}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor do Aporte</p>
                                        <p className="text-xl font-black text-[#00A3B1]">{invoice?.valor && formatCurrency(invoice.valor)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                     <button 
                                        type="button" 
                                        onClick={() => window.open(invoice?.arquivoUrl, '_blank')}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-[#00A3B1] hover:underline"
                                    >
                                        <Eye size={14} /> Baixar/Visualizar PDF
                                    </button>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Enviado em {invoice?.dataEnvio?.split(' ')[0]}
                                    </div>
                                </div>
                            </div>

                            <SelectField
                                label="Status da Análise"
                                value={status}
                                onChange={setStatus}
                                required
                                options={[
                                    { value: 'Aprovada', label: '✅ Aprovar' },
                                    { value: 'Rejeitada', label: '❌ Rejeitar' },
                                    { value: 'Em análise', label: '⏳ Manter Em Análise' },
                                ]}
                            />

                            {status === 'Rejeitada' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-[#002B49]">
                                        Descreva sua rejeição <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-start gap-2 bg-red-50 px-4 py-3 rounded-xl border border-red-100 text-xs text-red-500 mb-3">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <p>O consultor será notificado do motivo e precisará reenviar a nota corrigida.</p>
                                    </div>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        required={status === 'Rejeitada'}
                                        placeholder="Ex: A NF-e anexada não corresponde ao CNPJ cadastrado, ou valor retido está incorreto..."
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all min-h-[120px] resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full text-white py-4 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2
                                    ${status === 'Rejeitada' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                                      status === 'Aprovada' ? 'bg-[#002B49] hover:bg-[#001D32] shadow-[#002B49]/20' : 
                                      'bg-[#00A3B1] hover:bg-[#008c99] shadow-[#00A3B1]/20'}`}
                                >
                                    {loading ? 'Processando...' : 
                                     status === 'Rejeitada' ? 'Reprovar e Notificar Consultor' : 
                                     status === 'Aprovada' ? 'Aprovar Nota Fiscal' : 'Salvar Alterações'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-full bg-white border border-slate-200 text-slate-500 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InvoiceApprovalModal;
