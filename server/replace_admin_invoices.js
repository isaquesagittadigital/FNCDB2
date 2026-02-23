const fs = require('fs');
const path = require('path');

const listPath = path.join(__dirname, '../components/admin/invoices/InvoicesList.tsx');
const modalPath = path.join(__dirname, '../components/admin/invoices/InvoiceApprovalModal.tsx');

const newList = `
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Eye, CheckCircle, CreditCard, Clock } from 'lucide-react';
import InvoiceApprovalModal from './InvoiceApprovalModal';
import { supabase } from '../../../lib/supabase';
import { motion } from 'framer-motion';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const InvoicesList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Fetch invoices
            const { data: invData, error: invError } = await supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (invError) throw invError;

            // Fetch users to map creator_id to name
            const { data: usersData, error: usersError } = await supabase
                .from('usuarios')
                .select('id, nome, nome_fantasia');

            if (usersError) throw usersError;

            const userMap: Record<string, string> = {};
            usersData.forEach(u => {
                userMap[u.id] = u.nome_fantasia || u.nome || 'Consultor Desconhecido';
            });

            const mappedInvoices = (invData || []).map((inv: any) => ({
                id: inv.id,
                titulo: inv.titulo || 'Sem título',
                valor: typeof inv.valor === 'number' ? inv.valor : parseFloat(inv.valor) || 0,
                consultor: userMap[inv.creator_id] || 'Consultor',
                creator_id: inv.creator_id,
                arquivo: inv.arquivo_url ? inv.arquivo_url.split('/').pop() : 'arquivo.pdf',
                arquivoUrl: inv.arquivo_url,
                dataEnvio: new Date(inv.created_at).toLocaleString('pt-BR'),
                status: inv.status_nf || 'Pendente',
                mes_referencia: inv.mes_referencia,
                ano_referencia: inv.ano_referencia,
                rejectionReason: inv.motivo || '',
                raw: inv // Keep raw data just in case
            }));

            setInvoices(mappedInvoices);
        } catch (err: any) {
            console.error('Erro ao buscar notas:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleView = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleConfirmPayment = async (inv: any) => {
        if (!confirm(\`Deseja confirmar o pagamento da nota de \${inv.consultor} no valor de R$ \${inv.valor.toFixed(2).replace('.', ',')}?\`)) return;

        try {
            const data_pagamento = new Date().toISOString();
            const { error } = await supabase
                .from('invoices')
                .update({ status_nf: 'Paga', data_pagamento })
                .eq('id', inv.id);

            if (error) throw error;

            // Notify consultant
            await supabase.from('notificacoes').insert({
                titulo: 'Pagamento de Nota Confirmado',
                mensagem: \`Sua nota fiscal "\${inv.titulo}" foi paga com sucesso no dia \${new Date().toLocaleDateString('pt-BR')}.\`,
                user_id: inv.creator_id,
                lida: false
            });

            fetchInvoices();
            alert('Pagamento confirmado com sucesso!');
        } catch (err: any) {
             alert('Erro ao confirmar pagamento: ' + err.message);
        }
    };

    const handleApproveReject = async (result: { status: string, rejectionReason: string }) => {
        try {
            const updateData: any = { status_nf: result.status };
            if (result.status === 'Rejeitada') updateData.motivo = result.rejectionReason;
            
            const { error } = await supabase
                .from('invoices')
                .update(updateData)
                .eq('id', selectedInvoice.id);

            if (error) throw error;

            // Notify consultant
            const actionText = result.status === 'Aprovada' ? 'aprovada' : 'rejeitada';
            const extra = result.status === 'Rejeitada' ? \` Motivo: \${result.rejectionReason}\` : ' Aguarde o pagamento.';
            await supabase.from('notificacoes').insert({
                titulo: \`Nota Fiscal \${result.status}\`,
                mensagem: \`Sua nota fiscal "\${selectedInvoice.titulo}" foi \${actionText} pelo financeiro.\${extra}\`,
                user_id: selectedInvoice.creator_id,
                lida: false
            });

            fetchInvoices();
            setIsModalOpen(false);
        } catch (err: any) {
            alert('Erro ao atualizar status: ' + err.message);
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.consultor.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
          'Aprovada': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
          'Paga': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
          'Rejeitada': 'bg-[#FFF5F2] text-[#FF7A59] border-[#FF7A59]/10',
          'Em análise': 'bg-blue-50 text-blue-500 border-blue-100',
          'Pendente': 'bg-slate-50 text-slate-400 border-slate-200'
        };
        return (
          <span className={\`px-3 py-1 rounded-full text-[10px] font-bold border \${styles[status] || styles['Pendente']}\`}>
            {status || 'Pendente'}
          </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">
                    Análise Faturamento de Consultores
                </h2>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar por consultor ou nota"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFB] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8FAFB]/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                Lote / Referência
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                Valor
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                Consultor
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                Data Env.
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                Status
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-400">Carregando faturas...</td></tr>
                        )}
                        {!loading && filteredInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 border-b border-slate-50">
                                    <div className="text-sm font-bold text-[#002B49]">{invoice.titulo}</div>
                                    {invoice.mes_referencia && invoice.ano_referencia && (
                                        <div className="text-[10px] text-[#00A3B1] font-bold uppercase tracking-wider mt-1">
                                            Ref: {MONTHS[invoice.mes_referencia - 1]} {invoice.ano_referencia}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-[#002B49] border-b border-slate-50">
                                    {formatCurrency(invoice.valor)}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 border-b border-slate-50">
                                    {invoice.consultor}
                                </td>
                                <td className="px-6 py-5 text-xs font-medium text-slate-400 border-b border-slate-50">
                                    {invoice.dataEnvio}
                                </td>
                                <td className="px-6 py-5 border-b border-slate-50">
                                    <StatusBadge status={invoice.status} />
                                </td>
                                <td className="px-6 py-5 border-b border-slate-50 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => window.open(invoice.arquivoUrl, '_blank')}
                                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-all shadow-sm"
                                            title="Ver PDF"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        
                                        {['Pendente', 'Em análise'].includes(invoice.status) && (
                                            <button
                                                onClick={() => handleView(invoice)}
                                                className="px-3 py-1.5 bg-[#00A3B1] text-white rounded-lg hover:bg-[#008c99] transition-all text-xs font-bold shadow-md shadow-[#00A3B1]/20"
                                            >
                                                Analisar
                                            </button>
                                        )}

                                        {invoice.status === 'Aprovada' && (
                                            <button
                                                onClick={() => handleConfirmPayment(invoice)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] text-white rounded-lg hover:bg-[#001D32] transition-all text-xs font-bold shadow-md"
                                                title="Marcar como Paga"
                                            >
                                                <CreditCard size={14} /> Confirmar Pagto
                                            </button>
                                        )}
                                        {invoice.status === 'Paga' && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[#27C27B] text-xs font-bold">
                                                <CheckCircle size={14} /> Paga
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && filteredInvoices.length === 0 && (
                <div className="p-20 text-center text-slate-400 font-medium">
                    Nenhuma nota fiscal encontrada.
                </div>
            )}

            <InvoiceApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
                onApprove={handleApproveReject}
            />
        </div>
    );
};

export default InvoicesList;
`;

const newModal = `
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
                                    className={\`w-full text-white py-4 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2
                                    \${status === 'Rejeitada' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                                      status === 'Aprovada' ? 'bg-[#002B49] hover:bg-[#001D32] shadow-[#002B49]/20' : 
                                      'bg-[#00A3B1] hover:bg-[#008c99] shadow-[#00A3B1]/20'}\`}
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
`;

fs.writeFileSync(listPath, newList, 'utf8');
fs.writeFileSync(modalPath, newModal, 'utf8');
console.log('Admin Invoices components updated!');
