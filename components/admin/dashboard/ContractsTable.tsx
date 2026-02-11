import React, { useEffect, useState } from 'react';
import { FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Contract {
    id: string;
    user_id: string;
    titulo: string;
    status: string;
    valor_aporte: number;
    taxa_mensal: number;
    periodo_meses: number;
    data_inicio: string;
    client_name?: string;
    created_at?: string;
}

interface ContractsTableProps {
    onViewAllContracts?: () => void;
}

const ContractsTable: React.FC<ContractsTableProps> = ({ onViewAllContracts }) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts`);
            if (response.ok) {
                const data = await response.json();
                setContracts(data);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateEndDate = (startDate: string, months: number) => {
        if (!startDate) return '-';
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('pt-BR');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        // Handle potentially different date formats if needed, but assuming ISO from DB
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Pagination Logic
    const totalPages = Math.ceil(contracts.length / rowsPerPage);
    const currentContracts = contracts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'vigente':
            case 'ativo':
                return 'bg-green-100 text-green-700';
            case 'pendente':
            case 'rascunho':
                return 'bg-amber-100 text-amber-700';
            case 'cancelado':
                return 'bg-red-100 text-red-700';
            case 'finalizado':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-purple-100 text-purple-700';
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#002B49]">Contratos a vencer</h3>
                <button
                    onClick={onViewAllContracts}
                    className="flex items-center gap-2 text-sm text-[#00A3B1] font-bold hover:underline"
                >
                    <FileText size={16} />
                    Gerenciar contratos
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-[#00A3B1]" size={24} />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-l-lg">Cód. contrato</th>
                                    <th className="px-4 py-3 font-medium">Data aporte</th>
                                    <th className="px-4 py-3 font-medium">Fim do contrato</th>
                                    <th className="px-4 py-3 font-medium">Cliente</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Produto</th>
                                    <th className="px-4 py-3 font-medium text-right">Aporte</th>
                                    <th className="px-4 py-3 font-medium text-right">Rentabilidade %</th>
                                    <th className="px-4 py-3 font-medium text-right rounded-r-lg">Período</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentContracts.length > 0 ? (
                                    currentContracts.map((contract, index) => (
                                        <tr key={contract.id || index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-[#002B49] underline decoration-slate-300 underline-offset-4">
                                                {contract.id.substring(0, 6).toUpperCase()}
                                            </td>
                                            <td className="px-4 py-4 text-slate-500">{formatDate(contract.data_inicio)}</td>
                                            <td className="px-4 py-4">
                                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-medium">
                                                    {calculateEndDate(contract.data_inicio, contract.periodo_meses)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-500 truncate max-w-[150px]" title={contract.client_name}>
                                                {contract.client_name || '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusStyle(contract.status)}`}>
                                                    {contract.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-500">{contract.titulo}</td>
                                            <td className="px-4 py-4 text-right font-medium text-[#002B49]">{formatCurrency(contract.valor_aporte)}</td>
                                            <td className="px-4 py-4 text-right text-slate-500">{contract.taxa_mensal}%</td>
                                            <td className="px-4 py-4 text-right text-slate-500">{contract.periodo_meses} meses</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                                            Nenhum contrato encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 flex items-center gap-1 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>

                        <div className="text-sm text-slate-500">
                            Página <span className="font-bold text-[#002B49]">{page}</span> de <span className="font-bold text-[#002B49]">{totalPages || 1}</span>
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-[#002B49] font-medium flex items-center gap-1 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo <ChevronRight size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContractsTable;
