
import React, { useState, useEffect } from 'react';
import { Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface Client {
    id: string;
    nome_fantasia: string;
    razao_social: string;
    cpf: string;
    cnpj: string;
    email: string;
    celular: string;
    status_cliente: string;
    tipo_cliente: string;
}

interface ClientsListProps {
    onEdit: (id: string) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ onEdit }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        consultant: '',
        name: '',
        document: ''
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const LIMIT = 20;

    // Consultants Data
    const [consultantsList, setConsultantsList] = useState<{ id: string, nome_fantasia: string }[]>([]);

    const fetchConsultants = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/consultants`);
            if (res.ok) {
                const data = await res.json();
                setConsultantsList(data);
            }
        } catch (error) {
            console.error('Failed to fetch consultants', error);
        }
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: LIMIT.toString(),
                // Map filters to query params
                ...(filters.name && { name: filters.name }),
                ...(filters.document && { document: filters.document }),
                ...(filters.consultant && { consultant_id: filters.consultant })
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients?${queryParams}`);
            if (response.ok) {
                const { data, total } = await response.json();

                setClients(data);
                setTotalRecords(total);
                setTotalPages(Math.ceil(total / LIMIT));
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and on page change
    useEffect(() => {
        fetchClients();
        fetchConsultants();
    }, [page]);

    // Handle Search Button Click
    const handleSearch = () => {
        setPage(1); // Reset to page 1
        fetchClients();
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Filter Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-[#002B49] mb-4">Pesquisar cliente</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Consultor */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-500">Consultor</label>
                        <select
                            value={filters.consultant}
                            onChange={(e) => handleFilterChange('consultant', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-white text-slate-600"
                        >
                            <option value="">Todos</option>
                            {consultantsList.map(c => (
                                <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nome do cliente */}
                    <div className="space-y-1.5 md:col-span-1">
                        <label className="text-sm font-semibold text-slate-500">Nome do cliente</label>
                        <input
                            type="text"
                            placeholder="Digite o nome"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>

                    {/* Documento */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-500">Documento</label>
                        <input
                            type="text"
                            placeholder="CPF"
                            value={filters.document}
                            onChange={(e) => handleFilterChange('document', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>

                    {/* Search Button */}
                    <div>
                        <button
                            onClick={handleSearch}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors"
                        >
                            <Search size={18} />
                            Pesquisar
                        </button>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nome / Razão Social</th>
                                <th className="px-6 py-3 font-medium">Documento</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Telefone</th>
                                <th className="px-6 py-3 font-medium text-center">Tipo</th>
                                <th className="px-6 py-3 font-medium text-center">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-[#002B49]">
                                            {client.nome_fantasia || client.razao_social || '---'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                                            {client.cpf || client.cnpj || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {client.email || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {client.celular || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                                                {client.tipo_cliente === 'Pessoa Jurídica' ? 'PJ' : 'PF'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${client.status_cliente === 'Apto' || client.status_cliente === 'Ativo'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                {client.status_cliente || 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(client.id)}
                                                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-[#00A3B1] rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalRecords > 20 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </button>

                        <span className="text-sm text-slate-600 font-medium">
                            Página {page} de {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                            Próximo
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsList;
