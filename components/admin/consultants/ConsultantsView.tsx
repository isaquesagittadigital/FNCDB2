
import React, { useState } from 'react';
import { Plus, Home, ChevronRight, Edit2, Trash2, CheckCircle, Search, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

const ConsultantsView = () => {
    // Mock data based on the image provided
    const consultants = [
        { id: 1, name: 'Renan Furlan Rigo 4', email: 'renan_f_r@hotmail.com', document: '56.413.433/0001-23', clients: 1, status: 'Ativo' },
        { id: 2, name: 'Ricardo Ricchini Contesini', email: 'ricardo.ricchini@fncd.com.br', document: '59.209.301/0001-72', clients: 1, status: 'Ativo' },
        { id: 3, name: 'Jacson Daniel de Almeida dos Santos', email: 'jackson.1500@gmail.com', document: '83.564.851/0001-87', clients: 0, status: 'Ativo' },
        { id: 4, name: 'Dalton Marquez', email: 'madmarquezinvest@gmail.com', document: '60.220.661/0001-54', clients: 0, status: 'Ativo' },
        { id: 5, name: 'Daniel Alves e Silva', email: 'daniel@sevensteel.com.br', document: '28.380.293/0001-73', clients: 0, status: 'Ativo' },
        { id: 6, name: 'Patricia de Carvalho Aoki', email: 'patricia.aoki@ganbatteseguros.com.br', document: '57.497.748/0001-69', clients: 0, status: 'Ativo' },
        { id: 7, name: 'Jerusa Casagrande', email: 'jcbpofinanceiro@gmail.com', document: '63.189.083/0001-29', clients: 1, status: 'Ativo' },
        { id: 8, name: 'Rosimeire de Souza', email: 'rosesouza41@icloud.com', document: '63.019.472/0001-06', clients: 0, status: 'Ativo' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [documentTerm, setDocumentTerm] = useState('');

    return (
        <div className="space-y-6">
            {/* Header with Breadcrumbs and Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium">Consultor</span>
                    </div>
                </div>

                <button className="bg-[#009BB6] hover:bg-[#008f9e] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95">
                    <Plus size={18} />
                    Cadastrar novo consultor
                </button>
            </div>

            <h1 className="text-2xl font-bold text-[#002B49]">Consultores</h1>

            {/* Search Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Pesquisar consultor</h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Nome do consultor</label>
                        <input
                            type="text"
                            placeholder="Digite o nome"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                        />
                    </div>
                    <div className="w-full md:flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Documento</label>
                        <input
                            type="text"
                            placeholder="CPF ou CNPJ"
                            value={documentTerm}
                            onChange={(e) => setDocumentTerm(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                        />
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-cyan-700 hover:border-cyan-200 px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95">
                        <Search size={18} />
                        Pesquisar
                    </button>
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
                    <div className="col-span-3 pl-2">Nome</div>
                    <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Email
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-2">Documento</div>
                    <div className="col-span-1 text-center">Clientes</div>
                    <div className="col-span-1 text-center flex items-center justify-center gap-1 cursor-pointer hover:text-slate-700">
                        Status
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-2 text-right pr-4"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {consultants.map((consultant) => (
                        <div
                            key={consultant.id}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors group text-sm"
                        >
                            <div className="col-span-3 pl-2 font-medium text-slate-700 truncate" title={consultant.name}>
                                {consultant.name}
                            </div>
                            <div className="col-span-3 text-slate-500 truncate" title={consultant.email}>
                                {consultant.email}
                            </div>
                            <div className="col-span-2 text-slate-500 font-mono text-xs">
                                {consultant.document}
                            </div>
                            <div className="col-span-1 text-center text-slate-600 font-medium">
                                {consultant.clients}
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <span className="px-3 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-600 border-emerald-100">
                                    {consultant.status}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                                <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                                    <Trash2 size={16} />
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all" title="Editar">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Verificar">
                                    <CheckCircle size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default ConsultantsView;
