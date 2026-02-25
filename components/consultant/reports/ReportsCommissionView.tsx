import React, { useState } from 'react';
import { Home, ChevronRight, Search, RefreshCcw, PieChart, FileX } from 'lucide-react';

const ReportsCommissionView: React.FC = () => {
    const [cliente, setCliente] = useState('');
    const [mes, setMes] = useState('');
    const [ano, setAno] = useState('');
    const [hasResults, setHasResults] = useState(false); // To test both states

    const handleClear = () => {
        setCliente('');
        setMes('');
        setAno('');
        setHasResults(false);
    };

    const handleSearch = () => {
        // Show mocked results
        setHasResults(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Breadcrumb & Top Bar */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                    <Home size={16} />
                    <ChevronRight size={16} />
                    <span className="text-[#002B49] font-bold">Relatório de comissão mensal</span>
                </div>
                <h1 className="text-2xl font-bold text-[#002B49]">Relatório de comissão mensal</h1>
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
                        <label className="text-xs font-bold text-slate-500">Cliente</label>
                        <select
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] appearance-none"
                        >
                            <option value="">Selecione o cliente</option>
                            <option value="test">Carla Gandolfo</option>
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
                            <option value="08">Agosto</option>
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
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Search size={18} className="text-slate-400" />
                        Pesquisar
                    </button>
                </div>
            </div>

            {/* Results / Empty State */}
            {!hasResults ? (
                <div className="bg-white border border-slate-100 rounded-2xl py-32 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-[#E6F6F7] rounded-full flex items-center justify-center mb-6">
                        <FileX className="text-[#00A3B1]" size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-[#002B49] mb-1">Nenhum registro encontrado.</h4>
                    <p className="text-sm text-slate-500 font-medium">
                        Tente ajustar os filtros acima e pesquise novamente.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Box */}
                    <div className="bg-[#00A3B1] rounded-2xl p-6 text-white shadow-lg shadow-[#00A3B1]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-full bg-white/5 -skew-x-12 translate-x-1/3"></div>
                        <p className="text-white/80 font-bold text-sm mb-4 relative z-10">Resultado</p>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center rounded-full">
                                <PieChart size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-white/80 font-medium mb-1">Valor total</p>
                                <p className="text-2xl font-black tracking-tight">R$ 1.236.456,00</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8FAFB] border-b border-slate-100">
                                    <tr className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                                        <th className="px-5 py-4">Consultor</th>
                                        <th className="px-5 py-4">Cliente</th>
                                        <th className="px-5 py-4">Cód. contrato <span className="text-[10px]">↕</span></th>
                                        <th className="px-5 py-4">Parcela <span className="text-[10px]">↕</span></th>
                                        <th className="px-5 py-4">Spread <span className="text-[10px]">↕</span></th>
                                        <th className="px-5 py-4 whitespace-nowrap">Vencimento <span className="text-[10px]">↕</span></th>
                                        <th className="px-5 py-4">Comissão <span className="text-[10px]">↕</span></th>
                                        <th className="px-5 py-4">Status <span className="text-[10px]">↕</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-5 text-slate-500 font-medium whitespace-nowrap">Carla Gandolfo</td>
                                        <td className="px-5 py-5 text-slate-500 font-medium whitespace-nowrap">Carla Gandolfo</td>
                                        <td className="px-5 py-5 text-[#002B49] font-bold whitespace-nowrap">00001</td>
                                        <td className="px-5 py-5 text-slate-500">1/7</td>
                                        <td className="px-5 py-5 text-slate-500">0.5</td>
                                        <td className="px-5 py-5 text-slate-500 whitespace-nowrap">24/05/2025</td>
                                        <td className="px-5 py-5 text-[#002B49] font-medium whitespace-nowrap">R$ 2.400,00</td>
                                        <td className="px-5 py-5">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200">Sucesso</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <button disabled className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 bg-white opacity-50 cursor-not-allowed">
                                Anterior
                            </button>
                            <div className="hidden md:flex items-center gap-3 text-sm font-medium text-slate-500">
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
            )}
        </div>
    );
};

export default ReportsCommissionView;
