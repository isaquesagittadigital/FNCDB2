
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Copy,
  Plus,
  Lock,
  HandHelping,
  Search,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { LogoIcon } from '../shared/ui/Logo';
import ContractModal from '../shared/modals/ContractModal';
import PortfolioInfoModal from '../shared/modals/PortfolioInfoModal';

interface ConsultantDashboardProps {
  userProfile?: any;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ userProfile }) => {
  const [showValues, setShowValues] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showPortfolioInfo, setShowPortfolioInfo] = useState(false);
  const [showWalletContracts, setShowWalletContracts] = useState(false);

  // Dashboard data
  const [loading, setLoading] = useState(true);
  const [patrimonio, setPatrimonio] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [totalClients, setTotalClients] = useState(0);

  // Wallet contracts
  const [walletContracts, setWalletContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Commissions
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(true);
  const [commissionPage, setCommissionPage] = useState(1);
  const [commissionPagination, setCommissionPagination] = useState({ total: 0, totalPages: 1 });

  const consultorId = userProfile?.id;

  // Fetch dashboard summary
  useEffect(() => {
    if (!consultorId) return;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/admin/consultant/dashboard/${consultorId}`);
        const data = await res.json();
        setPatrimonio(data.patrimonio || 0);
        setTotalContracts(data.totalContracts || 0);
        setTotalClients(data.totalClients || 0);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [consultorId]);

  // Fetch commissions
  useEffect(() => {
    if (!consultorId) return;
    const fetchCommissions = async () => {
      try {
        setLoadingCommissions(true);
        const res = await fetch(`${API_URL}/admin/consultant/commissions/${consultorId}?page=${commissionPage}&limit=10`);
        const data = await res.json();
        setCommissions(data.commissions || []);
        setCommissionPagination(data.pagination || { total: 0, totalPages: 1 });
      } catch (err) {
        console.error('Error fetching commissions:', err);
      } finally {
        setLoadingCommissions(false);
      }
    };
    fetchCommissions();
  }, [consultorId, commissionPage]);

  // Fetch wallet contracts
  const fetchWalletContracts = async () => {
    if (!consultorId) return;
    try {
      setLoadingContracts(true);
      const res = await fetch(`${API_URL}/admin/consultant/contracts/${consultorId}`);
      const data = await res.json();
      setWalletContracts(data.contracts || []);
      setShowWalletContracts(true);
    } catch (err) {
      console.error('Error fetching wallet contracts:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Get display name
  const displayName = userProfile?.nome_fantasia || userProfile?.empresa || userProfile?.email || 'Consultor';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-[#002B49]">
            Bem-vindo(a) de volta, <span className="font-bold text-[#00A3B1]">{displayName}</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Gerencie suas participações com elegância e simplicidade.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              ID: {userProfile?.codigo_user || '—'}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(userProfile?.codigo_user || '')}
              className="text-slate-300 hover:text-[#00A3B1] transition-colors"
            >
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
            {loading ? (
              <Loader2 size={32} className="animate-spin text-white/60" />
            ) : (
              <span className={`text-5xl font-black tracking-tight transition-all duration-300 ${!showValues ? 'blur-md select-none opacity-80' : 'blur-0 opacity-100'}`}>
                {formatCurrency(patrimonio)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Participações Section */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#002B49]">Participações dos seus clientes</h2>
          <p className="text-slate-400 text-sm font-medium">Acompanhe a participação e desempenho individual de cada participação dos seus clientes:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pessoal Card */}
          <div
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
            onClick={fetchWalletContracts}
          >
            <div className="h-44 bg-gradient-to-br from-[#00A3B1]/40 to-[#00A3B1] relative flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#00A3B1] shadow-2xl shadow-white/20">
                <LogoIcon className="w-8 h-8" dark={true} />
              </div>
            </div>
            <div className="p-8 text-center space-y-6">
              <p className="text-sm font-bold text-[#002B49]">Pessoal</p>
              <div className={`text-2xl font-black text-[#00A3B1] tracking-tight transition-all duration-300 ${!showValues ? 'blur-md opacity-50' : 'blur-0 opacity-100'}`}>
                {loading ? <Loader2 size={20} className="animate-spin mx-auto text-slate-300" /> : formatCurrency(patrimonio)}
              </div>
            </div>
          </div>

          {/* Carteira herdada Card */}
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

        {loadingCommissions ? (
          <div className="bg-white border border-slate-100 rounded-2xl py-24 flex flex-col items-center justify-center shadow-sm">
            <Loader2 size={40} className="animate-spin text-[#00A3B1] mb-4" />
            <p className="text-slate-400 text-sm font-medium">Carregando comissões...</p>
          </div>
        ) : commissions.length > 0 ? (
          <>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-[#F8FAFB] border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">Cliente ↕</th>
                    <th className="px-6 py-4">Cód. contrato ↕</th>
                    <th className="px-6 py-4">Valor comissão</th>
                    <th className="px-6 py-4">Data de vencimento ↕</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {commissions.map((item, i) => (
                    <tr key={item.id || i} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 text-[#002B49] font-bold">{item.cliente_nome}</td>
                      <td className="px-6 py-5">
                        <span className="text-[#002B49] font-bold">
                          {item.codigo_contrato || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[#002B49] font-bold">
                        <span className={!showValues ? 'blur-sm select-none' : ''}>
                          {formatCurrency(item.valor_comissao)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-400">{formatDate(item.data_vencimento)}</td>
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

            {/* Pagination */}
            {commissionPagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setCommissionPage(p => Math.max(1, p - 1))}
                  disabled={commissionPage === 1}
                  className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-[#00A3B1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-sm text-slate-400 font-medium">
                  Mostrando {commissionPage} de {commissionPagination.totalPages} resultados
                </span>
                <button
                  onClick={() => setCommissionPage(p => Math.min(commissionPagination.totalPages, p + 1))}
                  disabled={commissionPage >= commissionPagination.totalPages}
                  className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-[#00A3B1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
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

      {/* ═══ Wallet Contracts Modal ═══ */}
      <AnimatePresence>
        {showWalletContracts && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalletContracts(false)}
              className="absolute inset-0 bg-[#002B49]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6F6F7] rounded-xl flex items-center justify-center">
                    <FileText className="text-[#00A3B1]" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-[#002B49]">Contratos vigente na carteira</h2>
                </div>
                <button
                  onClick={() => setShowWalletContracts(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingContracts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-[#00A3B1]" />
                  </div>
                ) : walletContracts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="font-medium">Nenhum contrato vigente na carteira.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFB] border-b border-slate-100">
                      <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        <th className="px-5 py-3">Cód. contrato</th>
                        <th className="px-5 py-3">Nome cliente</th>
                        <th className="px-5 py-3">Produto</th>
                        <th className="px-5 py-3">Aporte</th>
                        <th className="px-5 py-3">Taxa (%)</th>
                        <th className="px-5 py-3">Período</th>
                        <th className="px-5 py-3">Fim do contrato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {walletContracts.map((c, i) => (
                        <tr key={c.id || i} className="text-sm hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 text-[#002B49] font-bold">{c.codigo || 'N/A'}</td>
                          <td className="px-5 py-4 text-[#002B49] font-medium">{c.cliente_nome}</td>
                          <td className="px-5 py-4 text-slate-500">{c.produto ? `0001 - ${c.produto}` : '0001 - Câmbio'}</td>
                          <td className="px-5 py-4 text-[#002B49] font-bold">
                            <span className={!showValues ? 'blur-sm select-none' : ''}>
                              {formatCurrency(parseFloat(c.valor_aporte) || 0)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">{c.taxa_mensal}%</td>
                          <td className="px-5 py-4 text-slate-500">{c.periodo_meses} meses</td>
                          <td className="px-5 py-4 text-slate-400">{formatDate(c.data_fim)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
