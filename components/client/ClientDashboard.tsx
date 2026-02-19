
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContractDetailModal from '../shared/ContractDetailModal';


const ClientDashboard: React.FC = () => {
  const [showValues, setShowValues] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [totalEquity, setTotalEquity] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (user) {
          // Fetch user details
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userData) {
            setUserName(userData.nome_fantasia || userData.razao_social || userData.nome || 'Investidor');
            setUserData(userData);
          }

          // Fetch ONLY active/vigente contracts for this client
          const { data: contractsData, error: contractsError } = await supabase
            .from('contratos')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'Vigente')
            .order('created_at', { ascending: false });

          if (contractsData) {
            const formattedContracts = contractsData.map(contract => {
              const startDate = new Date(contract.data_inicio || contract.created_at);
              const endDate = new Date(startDate);

              if (contract.periodo_meses) {
                endDate.setMonth(endDate.getMonth() + contract.periodo_meses);
              } else {
                endDate.setFullYear(endDate.getFullYear() + 1);
              }

              // Calculate estimated accumulated return
              const now = new Date();
              const diffMs = now.getTime() - startDate.getTime();
              const diffMonths = Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 30.44));
              const taxaMensal = contract.taxa_mensal || 0;
              const valorAporte = contract.valor_aporte || 0;
              const rendimentoAcumulado = valorAporte * (taxaMensal / 100) * Math.min(diffMonths, contract.periodo_meses || 0);

              // Days remaining
              const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

              // Progress percentage
              const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const elapsedDays = totalDays - daysRemaining;
              const progressPercent = totalDays > 0 ? Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0;

              return {
                ...contract,
                id: contract.id,
                displayId: contract.codigo || contract.id.substring(0, 8).toUpperCase(),
                status: contract.status || 'Vigente',
                product: contract.titulo || 'Câmbio',
                valor: contract.valor_aporte,
                valor_formatado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAporte),
                yield: `${taxaMensal}%`,
                period: `${contract.periodo_meses || 0} meses`,
                startDate: startDate.toLocaleDateString('pt-BR'),
                endDate: endDate.toLocaleDateString('pt-BR'),
                aporte: startDate.toLocaleDateString('pt-BR'),
                conclusao: endDate.toLocaleDateString('pt-BR'),
                rendimento: 'Mensal',
                rendimentoAcumulado,
                rendimentoAcumuladoFormatado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rendimentoAcumulado),
                daysRemaining,
                progressPercent,
                taxaMensal,
              };
            });

            setContracts(formattedContracts);

            // Total equity = sum of all vigente contracts
            const total = contractsData.reduce((acc, curr) => acc + (Number(curr.valor_aporte) || 0), 0);
            setTotalEquity(total);

          }
        }
      } catch (error) {
        console.error('[ClientDashboard] Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-medium text-[#002B49]">
            Bem-vindo(a) de volta, <span className="font-bold text-[#00A3B1]">{userName || 'Carregando...'}</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Visualize seus contratos vigentes com elegância e simplicidade.</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-300 hover:text-slate-500 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            {showValues ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-[#00A3B1]" />}
            {showValues ? 'Esconder' : 'Mostrar'}
          </button>
        </div>
      </div>

      {/* Patrimônio Total Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#002B49] to-[#00A3B1] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-[#002B49]/10"
      >
        <div className="relative z-10 space-y-6">
          <p className="text-white/90 font-bold text-xs uppercase tracking-wider">Resumo das participações</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Patrimônio total</p>
              <p className="text-[10px] text-white/60 font-medium">Valor consolidado • {contracts.length} contrato{contracts.length !== 1 ? 's' : ''} vigente{contracts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className={`text-2xl sm:text-4xl font-black tracking-tight transition-all duration-300 ${!showValues ? 'blur-md opacity-80 select-none' : 'blur-0 opacity-100'}`}>
            {formatCurrency(totalEquity)}
          </div>
        </div>
        {/* Wave Graphic Decoration */}
        <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
          <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
            <path d="M0 100 Q 100 50 200 100 T 400 100 V 200 H 0 Z" fill="white" />
          </svg>
        </div>
      </motion.div>

      {/* Contracts Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#002B49]">Seus Contratos</h2>
            <p className="text-slate-400 text-sm font-medium">Acompanhe todos os seus contratos listados abaixo.</p>
          </div>
          {!loading && (
            <span className="px-4 py-1.5 bg-[#E6F6F7] text-[#00A3B1] text-xs font-bold rounded-full">
              {contracts.length} ativo{contracts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-28 bg-slate-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
                    <div className="h-6 bg-slate-100 rounded w-2/3 mx-auto" />
                  </div>
                </div>
              ))}
            </>
          ) : contracts.length > 0 ? (
            contracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ y: -5, boxShadow: '0 12px 40px -8px rgba(0, 43, 73, 0.12)' }}
                onClick={() => setSelectedContract(contract)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group transition-all cursor-pointer"
              >
                {/* Card Header */}
                <div className="h-28 bg-gradient-to-br from-[#002B49] to-[#00A3B1] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                      <path d="M0 50 Q 50 20 100 50 T 200 50 V 100 H 0 Z" fill="white" />
                    </svg>
                  </div>

                  {/* Code badge */}
                  <div className="absolute top-3 left-4 flex items-center gap-1.5">
                    <FileText size={12} className="text-white/60" />
                    <span className="text-[10px] font-bold text-white/80 tracking-wide">{contract.displayId}</span>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-3 right-4">
                    <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-200 text-[10px] font-bold rounded-full backdrop-blur-sm">
                      Vigente
                    </span>
                  </div>

                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#00A3B1] shadow-lg relative z-10">
                    <Sparkles size={20} fill="currentColor" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <p className="text-sm font-bold text-[#002B49] text-center">{contract.product}</p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-slate-400">Progresso</span>
                      <span className="text-[#00A3B1]">{contract.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${contract.progressPercent}%` }}
                        transition={{ delay: 0.3 + (0.1 * index), duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#00A3B1] to-[#00C9DB] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-medium">Aporte</p>
                      <p className="text-[11px] text-slate-600 font-bold">{contract.aporte}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[10px] text-slate-400 font-medium">Vencimento</p>
                      <p className="text-[11px] text-slate-600 font-bold">{contract.conclusao}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-medium">Taxa</p>
                      <p className="text-[11px] text-[#00A3B1] font-bold">{contract.yield} a.m.</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[10px] text-slate-400 font-medium">Prazo</p>
                      <p className="text-[11px] text-slate-600 font-bold">{contract.daysRemaining} dias</p>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="pt-3 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Valor investido</p>
                        <p className={`text-lg font-black text-[#002B49] tracking-tight transition-all duration-300 ${!showValues ? 'blur-sm opacity-50 select-none' : 'blur-0 opacity-100'}`}>
                          {contract.valor_formatado}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium">Rendimento est.</p>
                        <p className={`text-sm font-bold text-emerald-500 transition-all duration-300 ${!showValues ? 'blur-sm opacity-50 select-none' : 'blur-0 opacity-100'}`}>
                          +{contract.rendimentoAcumuladoFormatado}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-500">Nenhum contrato vigente</p>
                  <p className="text-sm text-slate-400">Quando você tiver contratos ativos, eles aparecerão aqui.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Contract Details Modal */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          userProfile={userData}
          role="client"
        />
      )}
    </div>
  );
};

export default ClientDashboard;
