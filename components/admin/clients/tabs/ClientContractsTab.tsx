
import React, { useState } from 'react';
import { FileText, Eye, Edit2 } from 'lucide-react';

interface ClientContractsProps {
    clientId?: string;
}

const ClientContractsTab: React.FC<ClientContractsProps> = ({ clientId }) => {
    // Mock Data
    const contracts = [
        { id: '1', title: 'Contrato de Prestação de Serviços', date: '02/09/2024', status: 'Assinado', code: '0000' },
        { id: '2', title: 'Termo de Adesão', date: '-', status: 'Pendente', code: '0000' },
    ];

    if (!clientId) {
        return <div className="p-8 text-center text-slate-500">Salve os dados gerais do cliente primeiro para visualizar contratos.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
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
                        {contracts.map((contract) => (
                            <tr key={contract.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-[#002B49]">{contract.code} - {contract.title}</td>
                                <td className="px-6 py-4 text-slate-500">{contract.date}</td>
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Mock */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-400" disabled>Previous</button>
                <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded text-sm font-bold text-[#002B49]">1</button>
                </div>
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-[#002B49]">Next</button>
            </div>
        </div>
    );
};

export default ClientContractsTab;
