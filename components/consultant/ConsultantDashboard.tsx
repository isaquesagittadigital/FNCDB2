
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Copy,
  Plus,
  Lock,
  HandHelping,
  Search
} from 'lucide-react';
import { LogoIcon } from '../shared/ui/Logo';
import ContractModal from '../shared/modals/ContractModal';
import PortfolioInfoModal from '../shared/modals/PortfolioInfoModal';

interface ConsultantDashboardProps {
  userProfile?: any;
}

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ userProfile }) => {
  const [showValues, setShowValues] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showPortfolioInfo, setShowPortfolioInfo] = useState(false);

  const commissions = [
    { client: 'Carla Gandolfo', id: '0000', parcel: 1, spread: 0, dueDate: '10/08/2025', value: 'R$ 50,00', status: 'Sucesso' },
    { client: 'Carla Gandolfo', id: '0000', parcel: 2, spread: 0, dueDate: '10/08/2025', value: 'R$ 50,00', status: 'Não processada' },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
      'Sucesso': 'bg-[#E6F6F7] text-[#00A3B1]',
      'Não processada': 'bg-[#FFF5F2] text-[#FF7A59]',
      'Bloqueada': 'bg-slate-100 text-slate-400'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap ${styles[status] || styles.Bloqueada}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-[#002B49]">
            Bem-vindo(a) de volta, <span className="font-bold text-[#00A3B1]">Carla</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Gerencie suas participações com elegância e simplicidade.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: 012345</span>
            <button className="text-slate-300 hover:text-[#00A3B1] transition-colors">
              <Copy size={12} />
            </button>
          </div>
          <button onClick={() => setShowPortfolioInfo(true)}>
            <HelpCircle size={20} className="text-slate-300 hover:text-slate-500 transition-colors" />
          </button>
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm active:scale-95 min-w-[130px] justify-center"
          >
            {showValues ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-[#00A3B1]" />}
            {showValues ? 'Esconder' : 'Mostrar'}
          </button>
        </div>
      </div>

      {/* Patrimônio Card */}
      <div className="bg-[#00A3B1] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-[#00A3B1]/20 group transition-all duration-500">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[15deg] translate-x-1/4 group-hover:translate-x-1/3 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-black/5 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 space-y-8">
          <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px]">Resumo das participações</p>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-white text-base font-bold">Patrimônio total</p>
              <p className="text-xs text-white/60 font-medium">Valor consolidado</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tight transition-all duration-300 ${!showValues ? 'blur-md select-none opacity-80' : 'blur-0 opacity-100'}`}>
              R$ 1.236.456,00
            </span>
          </div>
        </div>
      </div>

      {/* Participações Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#002B49]">Suas participações</h2>
          <p className="text-slate-400 text-sm font-medium">Acompanhe o desempenho individual de cada participação;</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pessoal Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
            <div className="h-44 bg-gradient-to-br from-[#00A3B1]/40 to-[#00A3B1] relative flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#00A3B1] shadow-2xl shadow-white/20">
                <LogoIcon className="w-8 h-8" dark={true} />
              </div>
            </div>
            <div className="p-8 text-center space-y-6">
              <p className="text-sm font-bold text-[#002B49]">Pessoal</p>
              <div className={`text-2xl font-black text-[#00A3B1] tracking-tight transition-all duration-300 ${!showValues ? 'blur-md opacity-50' : 'blur-0 opacity-100'}`}>
                R$ 1.236.456,00
              </div>
            </div>
          </div>

          {/* Administrada Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-all group grayscale hover:grayscale-0">
            <div className="h-44 bg-[#F1F5F9] relative flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-lg">
                <Lock size={28} />
              </div>
            </div>
            <div className="p-8 text-center space-y-6">
              <p className="text-sm font-bold text-slate-400">Carteira administrada</p>
              <div className="flex justify-center">
                <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-full border border-slate-100">
                  Carteira bloqueada
                </span>
              </div>
            </div>
          </div>

          {/* Herdada Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-all group grayscale hover:grayscale-0">
            <div className="h-44 bg-[#F1F5F9] relative flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-lg">
                <Lock size={28} />
              </div>
            </div>
            <div className="p-8 text-center space-y-6">
              <p className="text-sm font-bold text-slate-400">Carteira herdada</p>
              <div className="flex justify-center">
                <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-full border border-slate-100">
                  Carteira bloqueada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comissão a receber Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#002B49]">Comissão a receber</h2>

        {commissions.length > 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-[#F8FAFB] border-b border-slate-100">
                <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="px-6 py-4">Cliente ↕</th>
                  <th className="px-6 py-4">Cód. contrato ↕</th>
                  <th className="px-6 py-4">Parcela</th>
                  <th className="px-6 py-4">Spread</th>
                  <th className="px-6 py-4">Data de vencimento ↕</th>
                  <th className="px-6 py-4">Valor comissão</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {commissions.map((item, i) => (
                  <tr key={i} className="text-sm hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 text-[#002B49] font-bold">{item.client}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setSelectedContract(item)}
                        className="text-[#002B49] font-bold underline decoration-[#00A3B1]/30 hover:decoration-[#00A3B1]"
                      >
                        {item.id}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{item.parcel}</td>
                    <td className="px-6 py-5 text-slate-500 font-medium">{item.spread}</td>
                    <td className="px-6 py-5 text-slate-400">{item.dueDate}</td>
                    <td className="px-6 py-5 text-[#002B49] font-bold">
                      <span className={!showValues ? 'blur-sm select-none' : ''}>{item.value}</span>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedContract(item)}
                        className="p-2 text-slate-300 hover:text-[#00A3B1] hover:bg-[#E6F6F7] rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl py-24 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-[#E6F6F7] rounded-2xl flex items-center justify-center mb-6">
              <HandHelping className="text-[#00A3B1]" size={32} />
            </div>
            <h4 className="text-base font-bold text-[#002B49] mb-2">Você ainda não possui comissões a receber</h4>
            <p className="text-sm text-slate-400 font-medium max-w-sm">
              Quando houverem comissões, aparecerão aqui.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PortfolioInfoModal isOpen={showPortfolioInfo} onClose={() => setShowPortfolioInfo(false)} />
      <ContractModal
        isOpen={!!selectedContract}
        onClose={() => setSelectedContract(null)}
        contract={selectedContract}
        isValuesVisible={showValues}
      />
    </div>
  );
};

export default ConsultantDashboard;
