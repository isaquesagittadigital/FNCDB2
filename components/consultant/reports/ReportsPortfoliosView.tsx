import React, { useState } from 'react';
import { Home, ChevronRight, Search, RefreshCcw, FileText } from 'lucide-react';

const ReportsPortfoliosView: React.FC = () => {
    const [consultor, setConsultor] = useState('');
    const [mes, setMes] = useState('');
    const [ano, setAno] = useState('');

    const handleClear = () => {
        setConsultor('');
        setMes('');
        setAno('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Breadcrumb & Top Bar */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Home size={16} />
                    <ChevronRight size={16} />
                    <span className="text-[#002B49] font-bold">Relatório: Carteiras</span>
                </div>
                <h1 className="text-2xl font-bold text-[#002B49]">Relatório: Carteiras</h1>
            </div>

            {/* Filter Section */}
            <div className="bg-[#F8FAFB] border border-slate-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#002B49]">Filtro</h2>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-[#002B49] transition-colors"
                    >
                        <RefreshCcw size={16} />
                        Limpar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Consultor</label>
                        <select
                            value={consultor}
                            onChange={(e) => setConsultor(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] appearance-none"
                        >
                            <option value="">Selecione o consultor</option>
                            <option value="pessoal">Pessoal</option>
                        </select>
                    </div>
                    <div className="space-y-1.5 border-l border-slate-200 pl-4">
                        <label className="text-xs font-bold text-slate-500">Mês</label>
                        <select
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] appearance-none"
                        >
                            <option value="">Selecione o mês</option>
                            <option value="01">Janeiro</option>
                            <option value="02">Fevereiro</option>
                            <option value="03">Março</option>
                            {/* ... */}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Ano</label>
                        <select
                            value={ano}
                            onChange={(e) => setAno(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] appearance-none"
                        >
                            <option value="">Selecione o ano</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm">
                        <Search size={18} className="text-slate-400" />
                        Pesquisar
                    </button>
                </div>
            </div>

            {/* Empty State / Results */}
            <div>
                <h3 className="text-sm font-bold text-[#002B49] mb-4">Carteiras</h3>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAFB] border-b border-slate-100">
                            <tr className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                <th className="px-6 py-4">Nome do consultor <span className="text-[10px]">↕</span></th>
                                <th className="px-6 py-4">Carteira pessoal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5 text-slate-500 font-medium">00000</td>
                                <td className="px-6 py-5 text-slate-500">R$ 2.455.678,00</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <button disabled className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 bg-white opacity-50 cursor-not-allowed">
                            Anterior
                        </button>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                            <span className="text-[#002B49] bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center">1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>...</span>
                            <span>8</span>
                            <span>9</span>
                            <span>10</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-[#002B49] hover:bg-slate-50 transition-colors">
                            Próximo
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReportsPortfoliosView;
