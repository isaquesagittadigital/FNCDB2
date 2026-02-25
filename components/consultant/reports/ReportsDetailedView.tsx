import React, { useState } from 'react';
import { Home, ChevronRight, Download, RefreshCcw, FileX } from 'lucide-react';

const ReportsDetailedView: React.FC = () => {
    const [carteira, setCarteira] = useState('');
    const [codigo, setCodigo] = useState('');
    const [cliente, setCliente] = useState('');

    const handleClear = () => {
        setCarteira('');
        setCodigo('');
        setCliente('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Breadcrumb & Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                        <Home size={16} />
                        <ChevronRight size={16} />
                        <span className="text-[#002B49] font-bold">Carteira detalhada</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#002B49]">Carteira detalhada</h1>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} className="text-slate-400" />
                    Exportar em XLSX
                </button>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Carteira</label>
                        <select
                            value={carteira}
                            onChange={(e) => setCarteira(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] appearance-none"
                        >
                            <option value="">Selecione a carteira</option>
                            <option value="pessoal">Carteira pessoal</option>
                            {/* More options... */}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Código do contrato</label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Nome do cliente</label>
                        <input
                            type="text"
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                </div>
            </div>

            {/* Empty State / Results */}
            <div className="bg-white border border-slate-100 rounded-2xl py-32 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-[#E6F6F7] rounded-full flex items-center justify-center mb-6">
                    <FileX className="text-[#00A3B1]" size={32} />
                </div>
                <h4 className="text-lg font-bold text-[#002B49] mb-1">Nenhuma nota encontrada.</h4>
                <p className="text-sm text-slate-500 font-medium">
                    Cadastre notas fiscais em sua conta para vê-las aqui
                </p>
            </div>

        </div>
    );
};

export default ReportsDetailedView;
