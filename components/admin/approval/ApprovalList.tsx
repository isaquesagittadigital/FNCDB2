import React from 'react';
import { Eye, Search, Filter } from 'lucide-react';
import { ApprovalProcess } from './types';

interface ApprovalListProps {
    processes: ApprovalProcess[];
    onViewDetails: (process: ApprovalProcess) => void;
}

const ApprovalList: React.FC<ApprovalListProps> = ({ processes, onViewDetails }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Lista de processos</h2>
                    <p className="text-sm text-slate-500">Gerencie as aprovações pendentes e finalizadas</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:border-transparent w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultor</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cod. Contrato</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aporte</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {processes.map((process, index) => (
                            <tr
                                key={process.id}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => onViewDetails(process)}
                            >
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{process.clientName}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{process.consultantName}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{process.contractCode}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.amount)}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{process.documentId}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${process.status === 'approved'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : process.status === 'rejected'
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                        {process.status === 'approved' ? 'Aprovado' : process.status === 'rejected' ? 'Reprovado' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDetails(process);
                                        }}
                                        className="text-[#002B49] hover:text-[#00406E] font-medium text-sm inline-flex items-center gap-1"
                                    >
                                        Visualizar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApprovalList;
