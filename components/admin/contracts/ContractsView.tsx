import React, { useState } from 'react';
import { Plus, Home, ChevronRight, Search, Trash2, Edit2, ArrowUpDown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ContractForm from './ContractForm';
import ContractDetailModal from '../../shared/ContractDetailModal';

const ContractsView = () => {
    // Mock data based on the image provided
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedContract, setSelectedContract] = useState<any>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [clientTerm, setClientTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');

    React.useEffect(() => {
        if (viewMode === 'list') {
            fetchContracts();
        }
    }, [viewMode]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts`);
            if (res.ok) {
                const data = await res.json();
                setContracts(data);
            }
        } catch (error) {
            console.error("Failed to fetch contracts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedId(null);
        setViewMode('create');
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        setViewMode('edit');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchContracts();
                alert('Contrato excluído com sucesso!');
            } else {
                alert('Erro ao excluir contrato.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir contrato.');
        }
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedId(null);
    };

    const getStatusBadge = (status: string) => {
        let style = "bg-slate-100 text-slate-600 border-slate-200"; // Default/Rascunho
        if (status === 'Vigente') style = "bg-purple-50 text-purple-600 border-purple-100";
        else if (status === 'Em processo') style = "bg-amber-50 text-amber-600 border-amber-100";
        else if (status === 'Finalizado') style = "bg-emerald-50 text-emerald-600 border-emerald-100";
        else if (status === 'Cancelado') style = "bg-red-50 text-red-600 border-red-100";

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
                {status}
            </span>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    // Filter logic
    const filteredContracts = contracts.filter(c => {
        const matchesClient = (c.client_name || '').toLowerCase().includes(clientTerm.toLowerCase());
        const matchesStatus = statusFilter ? c.status === statusFilter : true;
        const matchesProduct = productFilter ? c.titulo === productFilter : true;
        // Search term could match ID or other fields if needed
        return matchesClient && matchesStatus && matchesProduct;
    });

    if (viewMode === 'create' || viewMode === 'edit') {
        // Assume ContractForm is imported (must add import if missing)
        return (
            <ContractForm
                contractId={selectedId}
                onBack={handleBack}
                onSave={fetchContracts} // Callback to refresh list
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Breadcrumbs and Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium">Contratos</span>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="bg-[#009BB6] hover:bg-[#008f9e] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    Cadastrar novo contrato
                </button>
            </div>

            <h1 className="text-2xl font-bold text-[#002B49]">Contratos</h1>

            {/* Filter Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6"
            >
                <h2 className="text-sm font-semibold text-slate-700">Pesquisar contrato</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Cliente</label>
                        <input
                            type="text"
                            placeholder="Nome do cliente"
                            value={clientTerm}
                            onChange={(e) => setClientTerm(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Produto</label>
                        <select
                            value={productFilter}
                            onChange={(e) => setProductFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="0001 - Câmbio">0001 - Câmbio</option>
                            <option value="0002 - Crédito Privado">0002 - Crédito Privado</option>
                            <option value="0003 - Fundo Exclusivo">0003 - Fundo Exclusivo</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Status do contrato</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="Rascunho">Rascunho</option>
                            <option value="Em processo">Em processo</option>
                            <option value="Vigente">Vigente</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider items-center">
                    <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Cód.
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Nome cliente
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-slate-700 justify-center">
                        Status
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Produto
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Aporte
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-1 text-center">Taxa (%)</div>
                    <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Período
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-slate-700 text-right">
                        Fim
                        <ArrowUpDown size={12} />
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Carregando contratos...</div>
                    ) : filteredContracts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Nenhum contrato encontrado.</div>
                    ) : (
                        filteredContracts.map((contract) => (
                            <div
                                key={contract.id}
                                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors group text-sm"
                            >
                                <div className="col-span-1 font-medium text-slate-700 truncate" title={contract.id}>
                                    {contract.id.slice(0, 8)}...
                                </div>
                                <div className="col-span-3 text-slate-600 truncate" title={contract.client_name}>
                                    {contract.client_name || 'Desconhecido'}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {getStatusBadge(contract.status)}
                                </div>
                                <div className="col-span-2 text-slate-500 truncate" title={contract.titulo}>
                                    {contract.titulo}
                                </div>
                                <div className="col-span-2 font-medium text-slate-700">
                                    {formatCurrency(contract.valor_aporte || 0)}
                                </div>
                                <div className="col-span-1 text-center text-slate-500">
                                    {contract.taxa_mensal || '-'}
                                </div>
                                <div className="col-span-1 text-slate-500 text-center">
                                    {contract.periodo_meses || '-'}
                                </div>
                                <div className="col-span-1 text-right text-slate-500 relative flex items-center justify-end gap-2">
                                    <span>{formatDate(contract.data_fim)}</span>
                                    <button
                                        onClick={() => setSelectedContract(contract)}
                                        className="text-slate-300 hover:text-cyan-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ver contrato"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contract.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(contract.id)}
                                        className="text-slate-300 hover:text-cyan-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Contract Detail Modal */}
            {selectedContract && (
                <ContractDetailModal
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            )}
        </div>
    );
};

export default ContractsView;
