
import React from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';

const ContractsTable: React.FC = () => {
    // Mock data
    const contracts = [
        { code: '0000', date: '02/09/2024', end: '02/09/2025', extCode: '-', status: 'Vigente', product: '0001 - Câmbio', amount: 'R$ 1.500,00', rent: '2%', period: '12' },
        { code: '0001', date: '10/08/2024', end: '10/08/2025', extCode: '-', status: 'Vigente', product: '0001 - Câmbio', amount: 'R$ 5.000,00', rent: '2%', period: '12' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#002B49]">Contratos a vencer</h3>
                <button className="flex items-center gap-2 text-sm text-[#00A3B1] font-bold hover:underline">
                    <FileText size={16} />
                    Gerenciar contratos
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                        <tr>
                            <th className="px-4 py-3 font-medium rounded-l-lg">Cód. contrato</th>
                            <th className="px-4 py-3 font-medium">Data aporte</th>
                            <th className="px-4 py-3 font-medium">Fim do contrato</th>
                            <th className="px-4 py-3 font-medium">Cód. contr. (ext)</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Produto</th>
                            <th className="px-4 py-3 font-medium text-right">Aporte</th>
                            <th className="px-4 py-3 font-medium text-right">Rentabilidade %</th>
                            <th className="px-4 py-3 font-medium text-right rounded-r-lg">Período</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {contracts.map((contract, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4 font-medium text-[#002B49] underline decoration-slate-300 underline-offset-4">{contract.code}</td>
                                <td className="px-4 py-4 text-slate-500">{contract.date}</td>
                                <td className="px-4 py-4"><span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-medium">{contract.end}</span></td>
                                <td className="px-4 py-4 text-slate-400">{contract.extCode}</td>
                                <td className="px-4 py-4">
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">{contract.status}</span>
                                </td>
                                <td className="px-4 py-4 text-slate-500">{contract.product}</td>
                                <td className="px-4 py-4 text-right font-medium text-[#002B49]">{contract.amount}</td>
                                <td className="px-4 py-4 text-right text-slate-500">{contract.rent}</td>
                                <td className="px-4 py-4 text-right text-slate-500">{contract.period}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
        </div>
    );
};

export default ContractsTable;
