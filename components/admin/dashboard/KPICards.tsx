
import React from 'react';
import { Zap } from 'lucide-react';

const KPICard = ({ title, value, trend, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between min-w-[280px]">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E6F6F7] flex items-center justify-center text-[#00A3B1]">
                    <Icon size={20} />
                </div>
                <span className="text-sm font-semibold text-slate-500">{title}</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-[#002B49]">{value}</h3>
                <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                    ↑ {trend} <span className="text-slate-400 font-normal">vs último mês</span>
                </p>
            </div>
        </div>
    </div>
);

const KPICards: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
                title="Total aportado na plataforma"
                value="R$ 3.234.435,11"
                trend="1.2%"
                icon={Zap}
            />
            <KPICard
                title="Número de consultores"
                value="48"
                trend="1.2%"
                icon={Zap}
            />
            <KPICard
                title="Número de clientes"
                value="523"
                trend="2.4%"
                icon={Zap}
            />
        </div>
    );
};

export default KPICards;
