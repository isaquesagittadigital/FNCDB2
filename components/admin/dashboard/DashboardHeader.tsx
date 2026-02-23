
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Loader2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { DateRange } from './AdminDashboard';

interface DashboardHeaderProps {
    onDateRangeChange?: (range: DateRange) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onDateRangeChange }) => {
    const [activePeriod, setActivePeriod] = useState('Mês atual');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Ref para fechamento do popover ao clicar fora
    const popoverRef = useRef<HTMLDivElement>(null);

    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const periods = ['Mês atual', 'Últimos 3 meses', 'Últimos 6 meses', 'Últimos 12 meses', 'Personalizado'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchUserName();
        applyPredefinedPeriod(activePeriod);
    }, []);

    const applyPredefinedPeriod = (period: string) => {
        const now = new Date();
        let start: string | null = null;
        let end: string | null = null;

        if (period === 'Mês atual') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            start = firstDay.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        } else if (period === 'Últimos 3 meses') {
            const date = new Date(now);
            date.setMonth(date.getMonth() - 3);
            start = date.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        } else if (period === 'Últimos 6 meses') {
            const date = new Date(now);
            date.setMonth(date.getMonth() - 6);
            start = date.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        } else if (period === 'Últimos 12 meses') {
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - 1);
            start = date.toISOString().split('T')[0];
            end = now.toISOString().split('T')[0];
        }

        if (period !== 'Personalizado' && onDateRangeChange) {
            onDateRangeChange({ start, end });
            setCustomStart('');
            setCustomEnd('');
        }
    };

    const handlePeriodClick = (period: string) => {
        setActivePeriod(period);
        applyPredefinedPeriod(period);
    };

    const handleApplyCustomFilter = () => {
        setActivePeriod('Personalizado');
        if (onDateRangeChange) {
            onDateRangeChange({ start: customStart || null, end: customEnd || null });
        }
        setIsPopoverOpen(false);
    };

    const fetchUserName = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('usuarios')
                    .select('nome, nome_fantasia, razao_social')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    const name = data.nome || data.nome_fantasia || data.razao_social;
                    if (name) {
                        setUserName(name.split(' ')[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao buscar nome do usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#002B49] flex items-center gap-2">
                    Bem-vindo(a) de volta,
                    {loading ? (
                        <Loader2 className="animate-spin text-[#00A3B1]" size={20} />
                    ) : (
                        <span className="text-[#00A3B1]">{userName || 'Administrador'}</span>
                    )}
                </h1>
                <p className="text-slate-500 mt-1">
                    Gerencie a plataforma através do painel administrativo
                </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
                <div className="flex gap-6 overflow-x-auto pb-px no-scrollbar">
                    {periods.map((period) => (
                        <button
                            key={period}
                            onClick={() => handlePeriodClick(period)}
                            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activePeriod === period
                                ? 'text-[#00A3B1]'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {period}
                            {activePeriod === period && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00A3B1]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative" ref={popoverRef}>
                    <button
                        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                        className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm transition-colors mb-2 sm:mb-0 ${activePeriod === 'Personalizado' ? 'border-[#00A3B1] text-[#00A3B1]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Calendar size={16} />
                        Filtrar por período
                        {(activePeriod === 'Personalizado' && (customStart || customEnd)) && (
                            <span className="ml-1 text-xs bg-[#E6F6F7] text-[#00A3B1] px-2 py-0.5 rounded-full font-semibold">
                                Ativo
                            </span>
                        )}
                    </button>

                    {/* Popover de Filtro */}
                    {isPopoverOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-[#002B49]">Filtrar por data</h4>
                                <button onClick={() => setIsPopoverOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Data inicial</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#00A3B1]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Data final</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#00A3B1]"
                                    />
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setCustomStart('');
                                            setCustomEnd('');
                                            handlePeriodClick('Mês atual');
                                            setIsPopoverOpen(false);
                                        }}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Limpar
                                    </button>
                                    <button
                                        onClick={handleApplyCustomFilter}
                                        className="flex-1 px-3 py-2 bg-[#00A3B1] hover:bg-[#008f9b] text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
