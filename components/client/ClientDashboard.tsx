
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContractDetailsModal from '../shared/documents/ContractDetailsModal';

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
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Fetch user details
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userData) {
            setUserName(userData.nome_fantasia || userData.razao_social || 'Investidor');
            setUserData(userData);
          }

          // Fetch contracts
          const { data: contractsData } = await supabase
            .from('contratos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (contractsData) {
            const formattedContracts = contractsData.map(contract => {
              // Handle potential date format differences
              // Use created_at if data_inicio is missing, logic: data_inicio > created_at
              const startDate = new Date(contract.data_inicio || contract.created_at);
              const endDate = new Date(startDate);

              if (contract.periodo_meses) {
                endDate.setMonth(endDate.getMonth() + contract.periodo_meses);
              } else {
                endDate.setFullYear(endDate.getFullYear() + 1); // Default to 1 year if not specified
              }

              return {
                ...contract,
                id: contract.id,
                displayId: contract.codigo || contract.id.substring(0, 8).toUpperCase(),
                status: contract.status || 'Pendente',
                product: contract.titulo || 'Câmbio',
                amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.valor_aporte || 0),
                yield: `${contract.taxa_mensal || 0}%`,
                period: `${contract.periodo_meses || 0} meses`,
                startDate: startDate.toLocaleDateString('pt-BR'),
                endDate: endDate.toLocaleDateString('pt-BR'),
                aporte: startDate.toLocaleDateString('pt-BR'),
                conclusao: endDate.toLocaleDateString('pt-BR'),
                valor: contract.valor_aporte,
                valor_formatado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.valor_aporte || 0),
                rendimento: 'Mensal'
              };
            });

            setContracts(formattedContracts);

            const total = contractsData.reduce((acc, curr) => acc + (Number(curr.valor_aporte) || 0), 0);
            setTotalEquity(total);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleContractClick = (contract: any) => {
    setSelectedContract(contract);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-[#002B49]">
            Bem-vindo(a) de volta, <span className="font-bold text-[#00A3B1]">{userName || 'Carregando...'}</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Visualize seus contatos com elegância e simplicidade.</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-300 hover:text-slate-500 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#002B49] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            {showValues ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-[#00A3B1]" />}
            {showValues ? 'Esconder' : 'Mostrar'}
          </button>
        </div>
      </div>

      {/* Patrimônio Teal Card */}
      <div className="bg-gradient-to-br from-[#002B49] to-[#00A3B1] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#002B49]/10">
        <div className="relative z-10 space-y-6">
          <p className="text-white/90 font-bold text-xs uppercase tracking-wider">Resumo das participações</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Patrimônio total</p>
              <p className="text-[10px] text-white/60 font-medium">Valor consolidado</p>
            </div>
          </div>
          <div className={`text-4xl font-black tracking-tight transition-all duration-300 ${!showValues ? 'blur-md opacity-80 select-none' : 'blur-0 opacity-100'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEquity)}
          </div>
        </div>
        {/* Wave Graphic Decoration */}
        <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
          <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
            <path d="M0 100 Q 100 50 200 100 T 400 100 V 200 H 0 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Contracts Grid Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#002B49]">Seus Contratos</h2>
          <p className="text-slate-400 text-sm font-medium">Acompanhe todos os seus contratos listados abaixo.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-10 text-center text-slate-400">Carregando contratos...</div>
          ) : contracts.length > 0 ? (
            contracts.map((contract) => (
              <motion.div
                key={contract.id}
                whileHover={{ y: -5 }}
                onClick={() => handleContractClick(contract)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group transition-all cursor-pointer hover:shadow-md"
              >
                {/* Card Header with Wave/Sparkle */}
                <div className="h-28 bg-gradient-to-br from-[#002B49] to-[#00A3B1] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                      <path d="M0 50 Q 50 20 100 50 T 200 50 V 100 H 0 Z" fill="white" />
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#00A3B1] shadow-lg relative z-10">
                    <Sparkles size={20} fill="currentColor" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 text-center space-y-4">
                  <p className="text-sm font-bold text-[#002B49]">{contract.product || 'Contrato'}</p>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 font-medium">Aporte: <span className="text-slate-600 font-bold">{contract.aporte}</span></p>
                    <p className="text-[11px] text-slate-400 font-medium">Conclusão: <span className="text-slate-600 font-bold">{contract.conclusao}</span></p>
                  </div>
                  <div className={`text-lg font-black text-[#00A3B1] tracking-tight transition-all duration-300 ${!showValues ? 'blur-sm opacity-50 select-none' : 'blur-0 opacity-100'}`}>
                    {contract.valor_formatado}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-400">Nenhum contrato encontrado.</div>
          )}
        </div>
      </div>

      {/* Contract Details Modal */}
      {selectedContract && (
        <ContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          userProfile={userData}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
