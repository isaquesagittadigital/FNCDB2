import React, { useState } from 'react';
import { Search, ChevronDown, Eye } from 'lucide-react';
import InvoiceApprovalModal from './InvoiceApprovalModal';

const InvoicesList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [mockInvoices, setMockInvoices] = useState([
        {
            id: '1',
            titulo: '45455',
            valor: 'R$ 15,00',
            consultor: 'Dalton Marquez',
            arquivo: 'Cadastro e pesquisa - Cadastrar - Pessoa física.jpg',
            dataEnvio: '04/02/2026 00:54',
            status: 'Processando'
        }
    ]);

    const handleView = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleApprove = async (data: any) => {
        setIsSaving(true);
        // Simulação de chamada de API
        setTimeout(() => {
            setMockInvoices(prev => prev.map(inv =>
                inv.id === selectedInvoice.id
                    ? { ...inv, status: data.status, rejectionReason: data.rejectionReason }
                    : inv
            ));
            setIsSaving(false);
            setIsModalOpen(false);
        }, 1000);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">
                    Histórico de notas fiscais
                </h2>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome"
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
                                <div className="flex items-center gap-2 cursor-pointer hover:text-[#00A3B1] transition-colors">
                                    Titulo <ChevronDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    Valor
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    Consultor
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-[#00A3B1] transition-colors">
                                    Arquivo <ChevronDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-[#00A3B1] transition-colors">
                                    Data de envio <ChevronDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <div className="flex items-center gap-2 cursor-pointer hover:text-[#00A3B1] transition-colors">
                                    Status <ChevronDown size={14} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 border-b border-slate-50">
                                    {invoice.titulo}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 border-b border-slate-50">
                                    {invoice.valor}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 border-b border-slate-50">
                                    {invoice.consultor}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-400 border-b border-slate-50 max-w-xs truncate">
                                    {invoice.arquivo}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-600 border-b border-slate-50">
                                    {invoice.dataEnvio}
                                </td>
                                <td className="px-6 py-5 border-b border-slate-50">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all duration-300
                                        ${invoice.status === 'Aprovada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            invoice.status === 'Rejeitada' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 border-b border-slate-50 text-right">
                                    <div className="flex items-center justify-end gap-2 overflow-hidden">
                                        <button
                                            onClick={() => handleView(invoice)}
                                            className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-[#002B49] hover:text-white transition-all active:scale-95 shadow-sm"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty state placeholder if needed */}
            {mockInvoices.length === 0 && (
                <div className="p-20 text-center text-slate-400 italic">
                    Nenhuma nota fiscal encontrada.
                </div>
            )}

            <InvoiceApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
                onApprove={handleApprove}
                loading={isSaving}
            />
        </div>
    );
};

export default InvoicesList;
