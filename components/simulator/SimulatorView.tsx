
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Calendar, User, DollarSign, Percent, Clock, ChevronRight, Download, Printer, ArrowLeft } from 'lucide-react';
import { LogoFull } from '../shared/ui/Logo';
import { supabase } from '../../lib/supabase';

interface SimulationRow {
    parcela: number;
    diasProRata: number;
    valorDividendo: number;
    dataPagamento: string;
    tipo: string;
}

interface Consultant {
    id: string;
    nome_fantasia: string;
    razao_social: string;
}

const SimulatorView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    // Add CSS to hide spin buttons
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type=number] {
                -moz-appearance: textfield;
            }
            input::-webkit-calendar-picker-indicator {
                background: transparent;
                bottom: 0;
                color: transparent;
                cursor: pointer;
                height: auto;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                width: auto;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const [dataAporte, setDataAporte] = useState('');
    const [consultor, setConsultor] = useState('');
    const [aporte, setAporte] = useState<number | ''>('');
    const [rentabilidade, setRentabilidade] = useState<number | ''>('');
    const [periodo, setPeriodo] = useState<number | ''>('');
    const [diaPagamento, setDiaPagamento] = useState(10);

    // Consultant search state
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [isLoadingConsultants, setIsLoadingConsultants] = useState(false);
    const [showConsultantDropdown, setShowConsultantDropdown] = useState(false);
    const [consultantSearch, setConsultantSearch] = useState('');

    useEffect(() => {
        const fetchConsultants = async () => {
            setIsLoadingConsultants(true);
            try {
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('id, nome_fantasia, razao_social')
                    .eq('tipo_user', 'Consultor')
                    .order('nome_fantasia');

                if (error) throw error;
                setConsultants(data || []);
            } catch (err) {
                console.error('Error fetching consultants:', err);
            } finally {
                setIsLoadingConsultants(false);
            }
        };

        fetchConsultants();
    }, []);

    const filteredConsultants = useMemo(() => {
        if (!consultantSearch) return [];
        return consultants.filter(c =>
            (c.nome_fantasia || '').toLowerCase().includes(consultantSearch.toLowerCase()) ||
            (c.razao_social || '').toLowerCase().includes(consultantSearch.toLowerCase())
        );
    }, [consultants, consultantSearch]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
    };

    const simulationData = useMemo(() => {
        if (!dataAporte || !aporte || !rentabilidade || !periodo) {
            return { rows: [], totalDividendos: 0, endDate: new Date() };
        }

        const rows: SimulationRow[] = [];
        const start = new Date(dataAporte + 'T00:00:00');
        const dailyRate = (Number(aporte) * (Number(rentabilidade) / 100)) / 30;
        const months = Number(periodo);


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
        for (let i = 2; i < months; i++) {
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
        if (months > 1) {
            const endDate = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
            const timeDiffEnd = endDate.getTime() - lastPaymentDate.getTime();
            const daysLastParcel = Math.ceil(timeDiffEnd / (1000 * 3600 * 24));

            rows.push({
                parcela: months,
                diasProRata: daysLastParcel,
                valorDividendo: daysLastParcel * dailyRate,
                dataPagamento: formatDate(endDate),
                tipo: 'Dividendo'
            });

            // 4. Return of capital
            rows.push({
                parcela: 0,
                diasProRata: 0,
                valorDividendo: Number(aporte),
                dataPagamento: formatDate(endDate),
                tipo: 'Valor do aporte'
            });
        }

        const totalDividendos = rows
            .filter(r => r.tipo === 'Dividendo')
            .reduce((sum, r) => sum + r.valorDividendo, 0);

        return { rows, totalDividendos, endDate: new Date(start.getFullYear(), start.getMonth() + months, start.getDate()) };
    }, [dataAporte, aporte, rentabilidade, periodo, diaPagamento]);


    return (
        <div className="min-h-screen bg-[#F8FAFB] pb-20">
            {/* Header / Logo */}
            <div className="flex justify-center py-10">
                <LogoFull dark={true} className="h-10" />
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-4">

                {/* Wizard Dividendos Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8"
                >
                    <div className="p-8">
                        <h2 className="text-[16px] font-bold text-[#002B49] mb-1">Wizard Dividendos</h2>
                        <p className="text-slate-400 text-[14px] mb-8">
                            Simule aportes, calcule dividendos e visualize o cronograma completo de pagamentos de forma rápida e intuitiva.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            {/* Row 1 */}
                            <div className="space-y-2">
                                <label className="text-[14px] font-medium text-slate-700 flex items-center">
                                    Data do aporte <span className="text-[#009BB6] ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dataAporte}
                                        onChange={(e) => setDataAporte(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] text-slate-700 bg-white transition-all appearance-none cursor-pointer"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#009BB6] pointer-events-none" size={20} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[14px] font-medium text-slate-700 flex items-center">
                                    Consultor <span className="text-[#009BB6] ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={consultantSearch}
                                        onChange={(e) => {
                                            setConsultantSearch(e.target.value);
                                            setShowConsultantDropdown(true);
                                            if (!e.target.value) setConsultor('');
                                        }}
                                        onFocus={() => setShowConsultantDropdown(true)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] text-slate-700 bg-white transition-all"
                                        placeholder="Selecione o consultor"
                                    />
                                    {isLoadingConsultants && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-[#009BB6] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}

                                    {showConsultantDropdown && (consultantSearch || filteredConsultants.length > 0) && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowConsultantDropdown(false)}
                                            ></div>
                                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto">
                                                {filteredConsultants.length > 0 ? (
                                                    filteredConsultants.map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setConsultor(c.nome_fantasia || c.razao_social);
                                                                setConsultantSearch(c.nome_fantasia || c.razao_social);
                                                                setShowConsultantDropdown(false);
                                                            }}
                                                            className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                                                        >
                                                            <span className="font-bold text-[#002B49] text-sm">{c.nome_fantasia}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{c.razao_social}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-5 py-4 text-center text-slate-400 text-sm italic">
                                                        Nenhum consultor encontrado
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Aporte, Rentabilidade, Período */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                            <div className="md:col-span-6 space-y-2">
                                <label className="text-[14px] font-medium text-slate-700 flex items-center">
                                    Aporte <span className="text-[#009BB6] ml-1">*</span>
                                </label>
                                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#009BB6]/10 focus-within:border-[#009BB6] transition-all">
                                    <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-sm font-bold flex items-center justify-center min-w-[60px]">
                                        R$
                                    </div>
                                    <input
                                        type="text"
                                        value={aporte === '' ? '' : aporte.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            if (!rawValue) {
                                                setAporte('');
                                                return;
                                            }
                                            const numericValue = Number(rawValue) / 100;
                                            setAporte(numericValue);
                                        }}
                                        className="w-full px-4 py-3 focus:outline-none text-slate-700"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <label className="text-[14px] font-medium text-slate-700 flex items-center">
                                    Rentabilidade <span className="text-[#009BB6] ml-1">*</span>
                                </label>
                                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#009BB6]/10 focus-within:border-[#009BB6] transition-all">
                                    <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center min-w-[75px] whitespace-nowrap">
                                        % a.m.
                                    </div>
                                    <input
                                        type="text"
                                        value={rentabilidade === '' ? '' : rentabilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            if (!rawValue) {
                                                setRentabilidade('');
                                                return;
                                            }
                                            let numericValue = Number(rawValue) / 100;
                                            if (numericValue > 2) numericValue = 2;
                                            setRentabilidade(numericValue);
                                        }}
                                        className="w-full px-4 py-3 focus:outline-none text-slate-700"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <label className="text-[14px] font-medium text-slate-700 flex items-center">
                                    Período <span className="text-[#009BB6] ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={periodo || ''}
                                        onChange={(e) => setPeriodo(Number(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] text-slate-700 appearance-none bg-white transition-all cursor-pointer"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value={6}>6 meses</option>
                                        <option value={12}>12 meses</option>
                                        <option value={18}>18 meses</option>
                                        <option value={24}>24 meses</option>
                                        <option value={30}>30 meses</option>
                                        <option value={36}>36 meses</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronRight className="rotate-90" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {simulationData.rows.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-6 space-y-2">
                                        <label className="text-[14px] font-medium text-slate-700">Soma dos dividendos</label>
                                        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
                                            <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-sm font-bold flex items-center justify-center min-w-[60px]">
                                                R$
                                            </div>
                                            <div className="w-full px-4 py-3 text-slate-700 font-medium">
                                                {simulationData.totalDividendos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-10 p-5 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4">
                            <div className="text-[#009BB6] mt-0.5">
                                <Clock size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[12px] font-bold text-[#002B49] uppercase tracking-wider">Importante</p>
                                <p className="text-[12px] text-slate-500 leading-relaxed">
                                    Após inserir os valores, consulte na tabela abaixo o detalhamento da simulação de dividendos calculados com a rentabilidade especificada.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Detalhes da Simulação Card */}
                <AnimatePresence>
                    {simulationData.rows.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12"
                        >
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-[16px] font-bold text-[#002B49] mb-1">Detalhes da Simulação</h2>
                                    <p className="text-slate-400 text-[14px]">
                                        Estes valores representam a projeção do contrato conforme os parâmetros informados no início da simulação.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="p-5 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-[14px] text-slate-500 mb-1">Rendimento</p>
                                        <p className="text-[#009BB6] font-bold text-[16px]">Mensal</p>
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-[14px] text-slate-500 mb-1">Dia de pagamento</p>
                                        <p className="text-[#009BB6] font-bold text-[16px]">{diaPagamento}</p>
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-[14px] text-slate-500 mb-1">Segundo pagamento</p>
                                        <p className="text-[#009BB6] font-bold text-[16px]">{simulationData.rows[1]?.dataPagamento.split('/')[0] || diaPagamento}</p>
                                    </div>
                                    <div className="p-5 bg-white rounded-2xl border border-slate-100">
                                        <p className="text-[14px] text-slate-500 mb-1">Fim do contrato</p>
                                        <p className="text-[#009BB6] font-bold text-[16px]">{formatDate(simulationData.endDate)}</p>
                                    </div>
                                </div>

                                {/* Table Wrapper for Responsiveness */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Parcela</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Dias pro rata</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Valor do dividendo</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Pagamento dividendo</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px] text-right">Tipo do dividendo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {simulationData.rows.map((row, idx) => (
                                                <tr key={idx} className="group transition-colors hover:bg-slate-50/50">
                                                    <td className="px-6 py-5 font-bold text-[#002B49] text-[14px]">
                                                        {row.parcela !== 0 ? row.parcela : (idx === simulationData.rows.length - 1 ? '' : '0')}
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-600 text-[14px]">
                                                        {row.diasProRata}
                                                    </td>
                                                    <td className="px-6 py-5 font-bold text-[#002B49] text-[14px]">
                                                        {formatCurrency(row.valorDividendo)}
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-600 text-[14px]">
                                                        {row.dataPagamento}
                                                    </td>
                                                    <td className="px-6 py-5 text-right text-[14px] text-slate-500">
                                                        {row.tipo}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SimulatorView;
