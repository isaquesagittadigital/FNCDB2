
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Calendar, User, DollarSign, Percent, Clock, ChevronRight, Download, Printer, ArrowLeft } from 'lucide-react';

interface SimulationRow {
    parcela: number;
    diasProRata: number;
    valorDividendo: number;
    dataPagamento: string;
    tipo: string;
}

const SimulatorView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [dataAporte, setDataAporte] = useState('2026-02-01');
    const [consultor, setConsultor] = useState('Samuel Alves');
    const [aporte, setAporte] = useState(100000);
    const [rentabilidade, setRentabilidade] = useState(1.5);
    const [periodo, setPeriodo] = useState(6);
    const [diaPagamento, setDiaPagamento] = useState(10);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
    };

    const simulationData = useMemo(() => {
        const rows: SimulationRow[] = [];
        const start = new Date(dataAporte + 'T00:00:00');
        const dailyRate = (aporte * (rentabilidade / 100)) / 30;


        // 1. Calculate first payment date (10th of next month)
        let firstPaymentDate = new Date(start.getFullYear(), start.getMonth() + 1, diaPagamento);

        // Calculate days for first parcel
        const timeDiff = firstPaymentDate.getTime() - start.getTime();
        const daysFirstParcel = Math.ceil(timeDiff / (1000 * 3600 * 24));

        rows.push({
            parcela: 1,
            diasProRata: daysFirstParcel,
            valorDividendo: daysFirstParcel * dailyRate,
            dataPagamento: formatDate(firstPaymentDate),
            tipo: 'Dividendo'
        });

        // 2. Middle parcels (Full months)
        let lastPaymentDate = firstPaymentDate;
        for (let i = 2; i < periodo; i++) {
            const nextPayment = new Date(lastPaymentDate.getFullYear(), lastPaymentDate.getMonth() + 1, diaPagamento);
            rows.push({
                parcela: i,
                diasProRata: 0,
                valorDividendo: 30 * dailyRate,
                dataPagamento: formatDate(nextPayment),
                tipo: 'Dividendo'
            });
            lastPaymentDate = nextPayment;
        }

        // 3. Last parcel (Pro-rata until end of contract)
        if (periodo > 1) {
            const endDate = new Date(start.getFullYear(), start.getMonth() + periodo, start.getDate());
            const timeDiffEnd = endDate.getTime() - lastPaymentDate.getTime();
            const daysLastParcel = Math.ceil(timeDiffEnd / (1000 * 3600 * 24));

            rows.push({
                parcela: periodo,
                diasProRata: daysLastParcel,
                valorDividendo: daysLastParcel * dailyRate,
                dataPagamento: formatDate(endDate),
                tipo: 'Dividendo'
            });

            // 4. Return of capital
            rows.push({
                parcela: 0,
                diasProRata: 0,
                valorDividendo: aporte,
                dataPagamento: formatDate(endDate),
                tipo: 'Valor do aporte'
            });
        }

        const totalDividendos = rows
            .filter(r => r.tipo === 'Dividendo')
            .reduce((sum, r) => sum + r.valorDividendo, 0);

        return { rows, totalDividendos, endDate: new Date(start.getFullYear(), start.getMonth() + periodo, start.getDate()) };
    }, [dataAporte, aporte, rentabilidade, periodo, diaPagamento]);


    return (
        <div className="min-h-screen bg-[#F8FAFB] pb-20">
            {/* Header / Logo */}
            <div className="flex justify-center py-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#009BB6] rounded-xl flex items-center justify-center rotate-45">
                        <div className="text-white -rotate-45 font-bold text-xl">F</div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {onBack && (
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search);
                            if (params.get('view') === 'simulator') {
                                window.close();
                            } else {
                                onBack();
                            }
                        }}
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#009BB6] transition-colors"
                    >
                        <ArrowLeft size={18} />
                        {new URLSearchParams(window.location.search).get('view') === 'simulator' ? 'Fechar Simulador' : 'Voltar ao sistema'}
                    </button>
                )}

                {/* Wizard Dividendos Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8"
                >
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-[#002B49] mb-1">Wizard Dividendos</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Simule aportes, calcule dividendos e visualize o cronograma completo de pagamentos de forma rápida e intuitiva.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                                    Data do aporte <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dataAporte}
                                        onChange={(e) => setDataAporte(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] text-slate-600 bg-white"
                                    />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                                    Consultor <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={consultor}
                                        onChange={(e) => setConsultor(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] text-slate-600"
                                        placeholder="Nome do consultor"
                                    />
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                                    Aporte <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={aporte}
                                        onChange={(e) => setAporte(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] text-slate-600"
                                        placeholder="0,00"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                                        Rentabilidade <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={rentabilidade}
                                            onChange={(e) => setRentabilidade(Number(e.target.value))}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] text-slate-600"
                                            placeholder="1,50"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">% a.m.</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#002B49] flex items-center gap-2">
                                        Período <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={periodo}
                                        onChange={(e) => setPeriodo(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] text-slate-600 appearance-none bg-white"
                                    >
                                        <option value={3}>3 meses</option>
                                        <option value={6}>6 meses</option>
                                        <option value={12}>12 meses</option>
                                        <option value={24}>24 meses</option>
                                        <option value={36}>36 meses</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <label className="text-sm font-bold text-[#002B49]">Soma dos dividendos</label>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-lg font-bold text-[#009BB6]">
                                {formatCurrency(simulationData.totalDividendos)}
                            </div>
                        </div>

                        <div className="mt-10 p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex gap-3">
                            <div className="text-slate-400 mt-1">
                                <Clock size={16} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Importante</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Após inserir os valores, consulte na tabela abaixo o detalhamento da simulação de dividendos calculados com a rentabilidade especificada.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Detalhes da Simulação Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8"
                >
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-[#002B49] mb-1">Detalhes da Simulação</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Estes valores representam a projeção do contrato conforme os parâmetros informados no início da simulação.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Rendimento</p>
                                <p className="text-[#009BB6] font-bold">Mensal</p>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Dia de pagamento</p>
                                <p className="text-[#009BB6] font-bold">{diaPagamento}</p>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Segundo pagamento</p>
                                <p className="text-[#009BB6] font-bold">{simulationData.rows[1]?.dataPagamento.split('/')[0] || diaPagamento}</p>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fim do contrato</p>
                                <p className="text-[#009BB6] font-bold">{formatDate(simulationData.endDate)}</p>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mt-10 overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-[#002B49] text-xs uppercase tracking-wider">Parcela</th>
                                        <th className="px-6 py-4 font-bold text-[#002B49] text-xs uppercase tracking-wider">Dias pro rata</th>
                                        <th className="px-6 py-4 font-bold text-[#002B49] text-xs uppercase tracking-wider">Valor do dividendo</th>
                                        <th className="px-6 py-4 font-bold text-[#002B49] text-xs uppercase tracking-wider">Pagamento dividendo</th>
                                        <th className="px-6 py-4 font-bold text-[#002B49] text-xs uppercase tracking-wider text-right">Tipo do dividendo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {simulationData.rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-[#002B49]">{row.parcela !== 0 ? row.parcela : ''}</td>
                                            <td className="px-6 py-4 text-slate-500">{row.diasProRata !== 0 ? row.diasProRata : '-'}</td>
                                            <td className="px-6 py-4 font-medium text-slate-700">{formatCurrency(row.valorDividendo)}</td>
                                            <td className="px-6 py-4 text-slate-500">{row.dataPagamento}</td>
                                            <td className="px-6 py-4 text-slate-400 text-right">{row.tipo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                                <Printer size={18} />
                                Imprimir
                            </button>
                            <button className="px-6 py-3 bg-[#009BB6] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#008f9e] transition-shadow shadow-lg shadow-[#009BB6]/20 active:scale-95 transition-all">
                                <Download size={18} />
                                Exportar PDF
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SimulatorView;
