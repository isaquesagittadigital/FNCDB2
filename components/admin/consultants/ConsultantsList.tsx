
import React, { useState, useEffect } from 'react';
import { Edit, ChevronLeft, ChevronRight, Trash2, AlertTriangle, X, Users } from 'lucide-react';

interface Consultant {
    id: string;
    nome_fantasia: string;
    razao_social: string;
    cpf: string;
    cnpj: string;
    email: string;
    celular: string;
    status_cliente: string;
    client_count: number;
}

interface ConsultantsListProps {
    onEdit: (id: string) => void;
}

const ConsultantsList: React.FC<ConsultantsListProps> = ({ onEdit }) => {
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);

    // Suggestion State
    const [nameSuggestions, setNameSuggestions] = useState<Consultant[]>([]);
    const [docSuggestions, setDocSuggestions] = useState<Consultant[]>([]);
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [showDocSuggestions, setShowDocSuggestions] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [consultantToDelete, setConsultantToDelete] = useState<Consultant | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        name: '',
        document: ''
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const LIMIT = 15;

    const fetchConsultants = async (overrideFilters?: any) => {
        setLoading(true);
        try {
            const currentFilters = overrideFilters || filters;
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: LIMIT.toString(),
                ...(currentFilters.name && { name: currentFilters.name }),
                ...(currentFilters.document && { document: currentFilters.document })
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/consultants?${queryParams}`);
            if (response.ok) {
                const { data, total } = await response.json();
                setConsultants(data);
                setTotalRecords(total);
                setTotalPages(Math.ceil(total / LIMIT));
            }
        } catch (error) {
            console.error('Failed to fetch consultants', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search for suggestions (Name)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.name && filters.name.length >= 2 && !showNameSuggestions) {
                searchNameSuggestions(filters.name);
            } else if (!filters.name) {
                setNameSuggestions([]);
                setShowNameSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.name]);

    // Debounced search for suggestions (Document)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.document && filters.document.length >= 3 && !showDocSuggestions) {
                searchDocSuggestions(filters.document);
            } else if (!filters.document) {
                setDocSuggestions([]);
                setShowDocSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [filters.document]);

    const searchNameSuggestions = async (name: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/consultants?name=${name}&limit=5`);
            if (res.ok) {
                const { data } = await res.json();
                setNameSuggestions(data);
                setShowNameSuggestions(data.length > 0);
            }
        } catch (error) {
            console.error('Error fetching name suggestions', error);
        }
    };

    const searchDocSuggestions = async (doc: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/consultants?document=${doc}&limit=5`);
            if (res.ok) {
                const { data } = await res.json();
                setDocSuggestions(data);
                setShowDocSuggestions(data.length > 0);
            }
        } catch (error) {
            console.error('Error fetching doc suggestions', error);
        }
    };

    const isInitialMount = React.useRef(true);

    // Page change fetch
    useEffect(() => {
        if (isInitialMount.current) return;
        fetchConsultants();
    }, [page]);

    // Debounced fetch for filters
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isInitialMount.current) {
                isInitialMount.current = false;
                fetchConsultants();
                return;
            }
            setPage(1);
            fetchConsultants();
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (field: string, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);

        if (field === 'name' && value === '') setShowNameSuggestions(false);
        if (field === 'document' && value === '') setShowDocSuggestions(false);
    };

    const selectNameSuggestion = (c: Consultant) => {
        const newName = c.nome_fantasia || c.razao_social;
        const newFilters = { ...filters, name: newName };
        setFilters(newFilters);
        setShowNameSuggestions(false);
        setPage(1);
        fetchConsultants(newFilters);
    };

    const selectDocSuggestion = (c: Consultant) => {
        const newDoc = c.cpf || c.cnpj;
        const newFilters = { ...filters, document: newDoc };
        setFilters(newFilters);
        setShowDocSuggestions(false);
        setPage(1);
        fetchConsultants(newFilters);
    };

    const resetFilters = () => {
        const emptyFilters = { name: '', document: '' };
        setFilters(emptyFilters);
        setPage(1);
        fetchConsultants(emptyFilters);
    };

    const openDeleteModal = (c: Consultant) => {
        setConsultantToDelete(c);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setConsultantToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!consultantToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/consultants/${consultantToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchConsultants();
                closeDeleteModal();
            } else {
                const error = await res.json();
                alert(error.error || 'Erro ao inativar consultor');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Ocorreu um erro ao tentar inativar o consultor.');
        } finally {
            setIsDeleting(false);
        }
    };

    const isFilterActive = filters.name || filters.document;

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-visible">
                <h2 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Pesquisar consultor</h2>

                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-2 relative">
                        <label className="text-sm font-bold text-[#002B49]">Nome do consultor</label>
                        <input
                            type="text"
                            placeholder="Digite o nome"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            onFocus={() => filters.name.length >= 2 && setShowNameSuggestions(true)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] text-sm font-medium"
                        />
                        {showNameSuggestions && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {nameSuggestions.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => selectNameSuggestion(c)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col"
                                    >
                                        <span className="font-bold text-[#002B49] text-sm">{c.nome_fantasia || c.razao_social}</span>
                                        <span className="text-xs text-slate-400">{c.email}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 relative">
                        <label className="text-sm font-bold text-[#002B49]">Documento</label>
                        <input
                            type="text"
                            placeholder="CPF ou CNPJ"
                            value={filters.document}
                            onChange={(e) => handleFilterChange('document', e.target.value)}
                            onFocus={() => filters.document.length >= 3 && setShowDocSuggestions(true)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] text-sm font-medium"
                        />
                        {showDocSuggestions && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {docSuggestions.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => selectDocSuggestion(c)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col"
                                    >
                                        <span className="font-bold text-[#002B49] text-sm">{c.nome_fantasia || c.razao_social}</span>
                                        <span className="text-xs text-slate-400 font-mono">{c.cpf || c.cnpj}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isFilterActive && (
                            <button
                                onClick={resetFilters}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="Limpar Filtros"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <th className="px-6 py-5">Nome</th>
                                <th className="px-6 py-5 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                                    Email
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                                </th>
                                <th className="px-6 py-5">Documento</th>
                                <th className="px-6 py-5 text-center">Clientes</th>
                                <th className="px-6 py-5 text-center flex items-center justify-center gap-1 cursor-pointer hover:text-slate-700">
                                    Status
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                                </th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : consultants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Nenhum consultor encontrado.
                                    </td>
                                </tr>
                            ) : (
                                consultants.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-medium text-[#002B49] text-sm">
                                            {c.nome_fantasia || c.razao_social}
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-sm">
                                            {c.email}
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 font-mono text-sm whitespace-nowrap">
                                            {c.cnpj || c.cpf}
                                        </td>
                                        <td className="px-6 py-5 text-center text-slate-700 font-bold text-sm">
                                            {c.client_count || 0}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-4 py-1.5 bg-[#EEFDF5] text-[#00944F] rounded-full text-xs font-bold border border-[#D1F9E3]">
                                                Ativo
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDeleteModal(c)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Inativar"
                                                >
                                                    <Trash2 size={18} strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(c.id)}
                                                    className="p-2 text-slate-400 hover:text-[#00A3B1] hover:bg-cyan-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => alert('Verificação em desenvolvimento')}
                                                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Verificar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
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
                {!loading && (totalRecords > LIMIT) && (
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

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-[#002B49]">Confirmar Inativação</h3>
                            </div>
                            <button
                                onClick={closeDeleteModal}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-600 mb-6">
                                Tem certeza que deseja inativar o consultor <span className="font-bold text-[#002B49]">{consultantToDelete?.nome_fantasia || consultantToDelete?.razao_social}</span>?
                                <br /> Esta ação impossibilitará o acesso do usuário ao sistema.
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isDeleting ? 'Processando...' : 'Sim, Inativar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultantsList;
