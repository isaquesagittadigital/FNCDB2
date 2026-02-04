import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileText, Trash2, Eye } from 'lucide-react';
import { Field, SelectField } from '../../shared/ui/FormElements';

interface InvoiceApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any;
    onApprove: (data: any) => Promise<void>;
    loading?: boolean;
}

const InvoiceApprovalModal: React.FC<InvoiceApprovalModalProps> = ({
    isOpen,
    onClose,
    invoice,
    onApprove,
    loading
}) => {
    const [status, setStatus] = useState('Aprovada');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (invoice?.status === 'Rejeitada') {
            setStatus('Rejeitada');
            setRejectionReason(invoice.rejectionReason || '');
        } else {
            setStatus('Aprovada');
        }
    }, [invoice]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApprove({ status, rejectionReason });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    {/* Header - Fixed */}
                    <div className="p-8 pb-4 border-b border-slate-50 relative shrink-0">
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-1 rounded-full z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E6F6F7] text-[#00A3B1] rounded-full flex items-center justify-center shadow-sm">
                                    <Check size={24} strokeWidth={3} />
                                </div>
                                <h3 className="text-xl font-bold text-[#002B49]">Situação da nota fiscal</h3>
                            </div>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg border border-orange-100">
                                {invoice?.status || 'Processando'}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Field
                                label="Título da nota"
                                value={invoice?.titulo}
                                disabled
                                required
                            />

                            <Field
                                label="Valor da nota"
                                value={invoice?.valor}
                                disabled
                                required
                            />

                            <SelectField
                                label="Status do Processo"
                                value={status}
                                onChange={setStatus}
                                required
                                options={[
                                    { value: 'Aprovada', label: 'Aprovada' },
                                    { value: 'Rejeitada', label: 'Rejeitada' },
                                    { value: 'Pendente', label: 'Pendente' },
                                ]}
                            />

                            {/* File Card */}
                            <div className="bg-[#F8FAFB] border border-slate-100 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#002B49] truncate">
                                            {invoice?.arquivo || 'Documento.pdf'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                        <button type="button" className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-[#002B49] transition-colors">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            className="h-full bg-[#00A3B1]"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">100%</p>
                                </div>
                            </div>

                            {status === 'Rejeitada' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-[#002B49]">
                                        Descreva sua rejeição<span className="text-[#00A3B1]">*</span>
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        required
                                        placeholder="Insira o motivo da rejeição"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all min-h-[120px] resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-[#00A3B1]/20 active:scale-[0.98] transition-all disabled:bg-slate-300"
                                >
                                    {loading ? 'Processando...' : status === 'Rejeitada' ? 'Rejeitar nota fiscal' : 'Aprovar nota fiscal'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full bg-white border border-slate-200 text-slate-500 py-4 rounded-xl font-bold text-base hover:bg-slate-50 active:scale-[0.98] transition-all"
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
