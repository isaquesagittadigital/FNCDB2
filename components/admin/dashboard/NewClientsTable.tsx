
import React from 'react';
import { UserPlus, MoreHorizontal } from 'lucide-react';

const NewClientsTable: React.FC = () => {
    const [clients, setClients] = React.useState<any[]>([]);
    const [totalClients, setTotalClients] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/recent`);
                if (response.ok) {
                    const { data, total } = await response.json();

                    const formattedClients = data.map((client: any) => ({
                        id: client.id,
                        name: client.nome_fantasia || client.razao_social || 'Sem Nome',
                        consultant: client.meu_consultor?.[0]?.consultor?.nome_fantasia || client.meu_consultor?.[0]?.consultor?.razao_social || 'Sem Consultor',
                        doc: client.cnpj || client.cpf || '---',
                        status: client.status_cliente || 'Pendente',
                        type: client.tipo_cliente === 'Pessoa Jurídica' ? 'Jurídica' : 'Física',
                        isNew: true
                    }));
                    setClients(formattedClients);
                    setTotalClients(total || 0);
                }
            } catch (error) {
                console.error('Failed to fetch clients', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-slate-500">Carregando clientes...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#002B49]">Novos clientes</h3>
                <button className="flex items-center gap-2 text-sm text-[#00A3B1] font-bold hover:underline">
                    <UserPlus size={16} />
                    Ver todos os clientes
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                        <tr>
                            <th className="px-4 py-3 font-medium rounded-l-lg w-16"></th>
                            <th className="px-4 py-3 font-medium">Nome</th>
                            <th className="px-4 py-3 font-medium">Consultor</th>
                            <th className="px-4 py-3 font-medium">Documento</th>
                            <th className="px-4 py-3 font-medium text-center">Status</th>
                            <th className="px-4 py-3 font-medium text-center rounded-r-lg">Tipo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clients.map((client, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4">
                                    {client.isNew && <span className="text-[10px] font-bold text-[#00A3B1] bg-[#E6F6F7] px-2 py-0.5 rounded-full border border-[#00A3B1]/20">Novo</span>}
                                </td>
                                <td className="px-4 py-4 font-medium text-[#002B49]">{client.name}</td>
                                <td className="px-4 py-4 text-slate-500">{client.consultant}</td>
                                <td className="px-4 py-4 text-slate-400 font-mono text-xs">{client.doc}</td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${client.status === 'Apto' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-red-700 bg-red-50 border border-red-100'
                                        }`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        • {client.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalClients > 10 && (
                <div className="flex items-center justify-between mt-4">
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
                        ← Anterior
                    </button>
                    <div className="flex gap-2 text-sm text-slate-600">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded font-medium text-[#002B49]">1</span>
                        <span className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded cursor-pointer">2</span>
                        <span className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded cursor-pointer">3</span>
                        <span className="w-8 h-8 flex items-center justify-center">...</span>
                        <span className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded cursor-pointer">10</span>
                    </div>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-[#002B49] font-medium hover:bg-slate-50">
                        Próximo →
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewClientsTable;
