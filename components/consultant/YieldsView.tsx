/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { Home, ChevronRight, Search, FileText, Send, Calendar as CalendarIcon, FileX, ChevronLeft } from 'lucide-react';
import SendYieldModal from './modals/SendYieldModal';
import { supabase } from '../../lib/supabase';

interface YieldsViewProps {
    userProfile?: any;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const YieldsView: React.FC<YieldsViewProps> = ({ userProfile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const consultorId = userProfile?.id;

    useEffect(() => {
        // Fetch clients for the dropdown
        if (consultorId) {
            fetch(`${API_URL}/admin/consultant/clients/${consultorId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.clients) setClients(data.clients);
                })
                .catch(err => console.error('Error fetching clients:', err));
        }
    }, [consultorId]);

    // For this mockup, we don't have an endpoint for Consultant Yields yet,
    // we'll implement the empty state and mock data if needed for UI verification
    const filteredDocs = documents.filter(doc =>
        doc.arquivo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
    const currentDocs = filteredDocs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('pt-BR');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Breadcrumb & Title */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                <Home size={16} />
                <ChevronRight size={16} />
                <span className="text-[#002B49] font-bold">Informe de rendimentos</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-[#002B49]">Informe de rendimentos</h1>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {documents.length > 0 && (
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Pesquisar"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                            />
                        </div>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
                    >
                        <CalendarIcon size={18} className="text-slate-400" />
                        Selecionar período
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white border border-slate-100 rounded-2xl py-24 flex justify-center shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A3B1]" />
                </div>
            ) : documents.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F8FAFB] border-b border-slate-100">
                                <tr className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                    <th className="px-6 py-4">Data de envio</th>
                                    <th className="px-6 py-4 items-center gap-1">Arquivo <span className="text-[10px]">↕</span></th>
                                    <th className="px-6 py-4">Formato</th>
                                    <th className="px-6 py-4 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentDocs.map((doc, idx) => (
                                    <tr key={idx} className="text-sm hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(doc.data_envio)}</td>
                                        <td className="px-6 py-4 text-[#002B49] font-bold">{doc.arquivo}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">PDF</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-300 hover:text-[#00A3B1] transition-colors bg-white border border-slate-200 rounded-lg">
                                                <Send size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={16} /> Anterior
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-slate-100 text-[#002B49]' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                {totalPages > 5 && <span className="px-2 text-slate-400">...</span>}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-[#002B49] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                            >
                                Próximo <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl py-24 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-[#E6F6F7] rounded-full flex items-center justify-center mb-4">
                        <FileX className="text-[#00A3B1]" size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-[#002B49] mb-1">Nenhum informe encontrado.</h4>
                    <p className="text-sm text-slate-500 font-medium">
                        Não há informações para mostrar.
                    </p>
                </div>
            )}

            {/* Send Yield Modal */}
            <SendYieldModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clients={clients}
            />
        </div>
    );
};

export default YieldsView;
