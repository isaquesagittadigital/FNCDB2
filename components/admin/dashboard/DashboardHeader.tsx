
import React, { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const DashboardHeader: React.FC = () => {
    const [activePeriod, setActivePeriod] = useState('Mês atual');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const periods = ['Mês atual', 'Últimos 3 meses', 'Últimos 6 meses', 'Últimos 12 meses'];

    useEffect(() => {
        fetchUserName();
    }, []);

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
                            onClick={() => setActivePeriod(period)}
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

                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors mb-2 sm:mb-0">
                    <Calendar size={16} />
                    Filtrar por período
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
