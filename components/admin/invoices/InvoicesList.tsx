
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
                .select('id, nome_fantasia');

            if (usersError) throw usersError;

            const userMap: Record<string, string> = {};
            usersData.forEach(u => {
                userMap[u.id] = u.nome_fantasia || 'Consultor Desconhecido';
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
        if (!confirm(`Deseja confirmar o pagamento da nota de ${inv.consultor} no valor de R$ ${inv.valor.toFixed(2).replace('.', ',')}?`)) return;

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
                mensagem: `Sua nota fiscal "${inv.titulo}" foi paga com sucesso no dia ${new Date().toLocaleDateString('pt-BR')}.`,
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
            const extra = result.status === 'Rejeitada' ? ` Motivo: ${result.rejectionReason}` : ' Aguarde o pagamento.';
            await supabase.from('notificacoes').insert({
                titulo: `Nota Fiscal ${result.status}`,
                mensagem: `Sua nota fiscal "${selectedInvoice.titulo}" foi ${actionText} pelo financeiro.${extra}`,
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
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles['Pendente']}`}>
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
