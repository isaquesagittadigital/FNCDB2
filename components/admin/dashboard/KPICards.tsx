import React, { useState, useEffect } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const KPICard = ({ title, value, trend, icon: Icon, loading }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between min-w-[280px]">
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E6F6F7] flex items-center justify-center text-[#00A3B1]">
                    <Icon size={20} />
                </div>
                <span className="text-sm font-semibold text-slate-500">{title}</span>
            </div>
            <div>
                {loading ? (
                    <div className="h-8 flex items-center">
                        <Loader2 className="animate-spin text-slate-200" size={20} />
                    </div>
                ) : (
                    <h3 className="text-2xl font-bold text-[#002B49]">{value}</h3>
                )}
                <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                    ↑ {trend} <span className="text-slate-400 font-normal">vs último mês</span>
                </p>
            </div>
        </div>
    </div>
);

const KPICards: React.FC = () => {
    const [stats, setStats] = useState({
        totalAportado: 'R$ 0,00',
        totalConsultores: '0',
        totalClientes: '0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            const [contractsRes, consultantsRes, clientsRes] = await Promise.all([
                supabase.from('contratos').select('valor'),
                supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('tipo_user', 'Consultor'),
                supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('tipo_user', 'Cliente')
            ]);

            const total = contractsRes.data?.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0) || 0;

            setStats({
                totalAportado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
                totalConsultores: String(consultantsRes.count || 0),
                totalClientes: String(clientsRes.count || 0)
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
                title="Total aportado na plataforma"
                value={stats.totalAportado}
                trend="1.2%"
                icon={Zap}
                loading={loading}
            />
            <KPICard
                title="Número de consultores"
                value={stats.totalConsultores}
                trend="1.2%"
                icon={Zap}
                loading={loading}
            />
            <KPICard
                title="Número de clientes"
                value={stats.totalClientes}
                trend="2.4%"
                icon={Zap}
                loading={loading}
            />
        </div>
    );
};

export default KPICards;
