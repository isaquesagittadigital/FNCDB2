
import React, { useState } from 'react';
import { FileText, Eye, Edit2 } from 'lucide-react';

interface ClientContractsProps {
    clientId?: string;
}

const ClientContractsTab: React.FC<ClientContractsProps> = ({ clientId }) => {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (clientId) {
            fetchContracts();
        }
    }, [clientId]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/contracts`);
            if (res.ok) {
                const data = await res.json();
                setContracts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateContract = async () => {
        // For now, just create a placeholder record
        if (!clientId) return;

        const newContract = {
            titulo: 'Contrato de Prestação de Serviços',
            status: 'Pendente',
            data_assinatura: null,
            arquivo_url: null
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/contracts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContract)
            });

            if (res.ok) {
                fetchContracts();
            } else {
                alert('Erro ao gerar contrato');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar contrato');
        }
    };

    if (!clientId) {
        return <div className="p-8 text-center text-slate-500">Salve os dados gerais do cliente primeiro para visualizar contratos.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-end">
                <button
                    onClick={handleGenerateContract}
                    className="bg-[#002B49] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00385D] transition-colors"
                >
                    Gerar Novo Contrato
                </button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">Título do documento</th>
                            <th className="px-6 py-3 font-medium">Data assinatura</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-400">Carregando...</td></tr>
                        ) : contracts.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-400">Nenhum contrato encontrado.</td></tr>
                        ) : (
                            contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-[#002B49]">{contract.titulo}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {contract.data_assinatura ? new Date(contract.data_assinatura).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${contract.status === 'Assinado'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="text-[#00A3B1] font-medium text-xs hover:underline">
                                                {contract.status === 'Pendente' ? 'Assinar' : 'Ver'}
                                            </button>
                                            <button className="text-slate-400 hover:text-[#002B49]">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientContractsTab;
