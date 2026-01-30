import React, { useState } from 'react';
import { Plus, Home, ChevronRight, Search, Trash2, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

const ContractsView = () => {
    // Mock data based on the image provided
    const contracts = [
        { id: '23042849', client: 'Testes dev', status: 'Vigente', product: '0001 - Câmbio', amount: 30000, rate: '2,00%', period: '6 meses', endDate: '12/07/2026' },
        { id: '15368767', client: 'Samuel Alves de Souza', status: 'Vigente', product: '0001 - Câmbio', amount: 49000, rate: '1,50%', period: '6 meses', endDate: '06/07/2026' },
        { id: '17900772', client: 'Samuel Alves de Souza', status: 'Rascunho', product: '0001 - Câmbio', amount: 10000, rate: '2,00%', period: '6 meses', endDate: '21/07/2026' },
        { id: '65119088', client: 'Renan Furlan Rigo', status: 'Vigente', product: '0001 - Câmbio', amount: 10000, rate: '1,50%', period: '6 meses', endDate: '21/07/2026' },
        { id: '05515482', client: 'Carlos Casa Nova', status: 'Vigente', product: '0001 - Câmbio', amount: 51000, rate: '2,00%', period: '12 meses', endDate: '22/01/2027' },
        { id: '58032492', client: 'Samuel Alves de Souza', status: 'Em processo', product: '0001 - Câmbio', amount: 50000, rate: '2,00%', period: '12 meses', endDate: '22/12/2026' },
    ];

    const getStatusBadge = (status: string) => {
        let style = "bg-slate-100 text-slate-600 border-slate-200"; // Default/Rascunho

        if (status === 'Vigente') {
            style = "bg-purple-50 text-purple-600 border-purple-100";
        } else if (status === 'Em processo') {
            style = "bg-amber-50 text-amber-600 border-amber-100";
        }

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

    return (
        <div className="space-y-6">
            {/* Header with Breadcrumbs and Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium">Contratos</span>
                    </div>
                </div>

                <button className="bg-[#009BB6] hover:bg-[#008f9e] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95">
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
                        <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 bg-white">
                            <option value="">Selecione o cliente</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Consultor</label>
                        <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 bg-white">
                            <option value="">Selecione o consultor</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Produto</label>
                        <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 bg-white">
                            <option value="">Selecione o produto</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Status do contrato</label>
                        <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 bg-white">
                            <option value="">Selecionar status</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">CPF ou CNPJ</label>
                        <input type="text" placeholder="CPF ou CNPJ" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Código do contrato (externo)</label>
                        <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Código do contrato</label>
                        <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Aporte (início)<span className="text-cyan-500">*</span></label>
                        <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600" defaultValue="2026-01-30" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Aporte (fim)<span className="text-cyan-500">*</span></label>
                        <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600" defaultValue="2026-01-30" />
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
                        Cód. contrato
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
                        Fim do contrato
                        <ArrowUpDown size={12} />
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {contracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors group text-sm"
                        >
                            <div className="col-span-1 font-medium text-slate-700">
                                {contract.id}
                            </div>
                            <div className="col-span-3 text-slate-600 truncate" title={contract.client}>
                                {contract.client}
                            </div>
                            <div className="col-span-1 flex justify-center">
                                {getStatusBadge(contract.status)}
                            </div>
                            <div className="col-span-2 text-slate-500 truncate" title={contract.product}>
                                {contract.product}
                            </div>
                            <div className="col-span-2 font-medium text-slate-700">
                                {formatCurrency(contract.amount)}
                            </div>
                            <div className="col-span-1 text-center text-slate-500">
                                {contract.rate}
                            </div>
                            <div className="col-span-1 text-slate-500">
                                {contract.period}
                            </div>
                            <div className="col-span-1 text-right text-slate-500 relative flex items-center justify-end gap-2">
                                <span>{contract.endDate}</span>
                                <button className="ml-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default ContractsView;
