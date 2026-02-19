import React, { useState, useEffect } from 'react';
import { Home, Search, Eye, FileSearch, PenTool, ClipboardList } from 'lucide-react';
import KYCDocumentModal from './KYCDocumentModal';
import ContractDetailModal from './ContractDetailModal';
import ContractStatusBadge from './ui/ContractStatusBadge';
import { supabase } from '../../lib/supabase';

interface DocumentsViewProps {
  userProfile?: any;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ userProfile }) => {
  const [isInvestorFormOpen, setIsInvestorFormOpen] = useState(false);
  const [isContractDetailsOpen, setIsContractDetailsOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [emProcessoContracts, setEmProcessoContracts] = useState<any[]>([]);
  const [assinandoContracts, setAssinandoContracts] = useState<any[]>([]);
  const [fullUserData, setFullUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Fetch full user data from usuarios
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

          // Fetch onboarding data (KYC fields, suitability, compliance, validation_token, ip_address, etc.)
          const { data: onboardingData } = await supabase
            .from('user_onboarding')
            .select('*')
            .eq('user_id', user.id)
            .single();

          // Fetch bank account data
          const { data: bankAccounts } = await supabase
            .from('contas_bancarias')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);

          const bankAccount = bankAccounts?.[0] || {};

          // Merge all data with proper field name mapping
          const mergedData = {
            ...userData,
            // Map address fields (DB uses _end suffix, component expects without)
            logradouro: userData?.logradouro_end,
            numero: userData?.numero_end,
            complemento: userData?.complemento_end,
            // Merge onboarding KYC data
            ...onboardingData,
            // Parse JSON arrays if stored as strings
            resource_origin: typeof onboardingData?.resource_origin === 'string'
              ? JSON.parse(onboardingData.resource_origin)
              : (onboardingData?.resource_origin || []),
            experience_areas: typeof onboardingData?.experience_areas === 'string'
              ? JSON.parse(onboardingData.experience_areas)
              : (onboardingData?.experience_areas || []),
            // Add bank data at top level for KYCDocumentContent
            banco: bankAccount?.banco,
            agencia: bankAccount?.agencia,
            conta: bankAccount?.conta,
            bankAccount,
          };

          setFullUserData(mergedData);


          // Fetch "Em processo" contracts
          const { data: emProcessoData } = await supabase
            .from('contratos')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'Em processo')
            .order('created_at', { ascending: false });

          // Fetch "Assinando" contracts
          const { data: assinandoData } = await supabase
            .from('contratos')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'Assinando')
            .order('created_at', { ascending: false });

          const formatContract = (contract: any) => {
            const startDate = new Date(contract.data_inicio || contract.created_at);
            const endDate = new Date(startDate);
            if (contract.periodo_meses) {
              endDate.setMonth(endDate.getMonth() + contract.periodo_meses);
            } else {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            return {
              id: contract.id,
              displayId: contract.codigo || contract.id.substring(0, 8).toUpperCase(),
              status: contract.status || 'Pendente',
              product: contract.titulo || 'Contrato Padrão',
              amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.valor_aporte || 0),
              yield: contract.taxa_mensal ? `${contract.taxa_mensal}%` : '-',
              period: contract.periodo_meses ? `${contract.periodo_meses} meses` : '-',
              startDate: startDate.toLocaleDateString('pt-BR'),
              endDate: endDate.toLocaleDateString('pt-BR'),
              raw: contract,
              consultor_id: contract.consultor_id,
              codigo_externo: contract.codigo_externo,
              start_date_raw: startDate
            };
          };

          if (emProcessoData) {
            setEmProcessoContracts(emProcessoData.map(formatContract));
          }
          if (assinandoData) {
            setAssinandoContracts(assinandoData.map(formatContract));
          }
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const getInvestorProfileData = () => {
    const src = fullUserData || userProfile;
    const acceptedAt = src?.declarations_accepted_at;
    let signDate = '-';
    if (acceptedAt) {
      const d = new Date(acceptedAt);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      signDate = `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }

    return {
      name: src?.nome_fantasia || src?.razao_social || src?.nome || 'Nome do Cliente',
      document: src?.cnpj || src?.cpf || '000.000.000-00',
      suitabilityProfile: src?.suitability_profile || src?.perfil_investidor || 'Conservador',
      signatureDate: signDate
    };
  };

  const investorData = getInvestorProfileData();


  const handleContractClick = (contract: any) => {
    setSelectedContract(contract);
    setIsContractDetailsOpen(true);
  };

  const tableHeaders = ['Cód. contrato', 'Status', 'Produto', 'Aporte', 'Rentabilidade', 'Período', 'Data aporte', 'Fim do contrato'];

  const renderContractRow = (doc: any) => (
    <tr
      key={doc.id}
      className="text-sm hover:bg-slate-50 transition-colors cursor-pointer group"
      onClick={() => handleContractClick(doc)}
    >
      <td className="px-6 py-5">
        <button className="text-[#002B49] font-bold underline decoration-[#00A3B1]/30 group-hover:decoration-[#00A3B1] transition-all" title={doc.id}>
          {doc.displayId}
        </button>
      </td>
      <td className="px-6 py-5"><ContractStatusBadge status={doc.status} /></td>
      <td className="px-6 py-5 text-[#002B49] font-medium">{doc.product}</td>
      <td className="px-6 py-5 text-[#002B49] font-bold">{doc.amount}</td>
      <td className="px-6 py-5 text-[#002B49] font-medium">{doc.yield}</td>
      <td className="px-6 py-5 text-[#002B49] font-medium">{doc.period}</td>
      <td className="px-6 py-5 text-[#64748B]">{doc.startDate}</td>
      <td className="px-6 py-5 text-[#64748B]">{doc.endDate}</td>
    </tr>
  );

  const renderTable = (contracts: any[], emptyMessage: string) => (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Carregando...</div>
        ) : contracts.length > 0 ? (
          contracts.map(doc => (
            <div
              key={doc.id}
              onClick={() => handleContractClick(doc)}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm active:scale-95 transition-all"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                <span className="font-bold text-[#002B49] text-lg">{doc.displayId}</span>
                <ContractStatusBadge status={doc.status} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Produto</span>
                  <span className="font-bold text-[#002B49]">{doc.product}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Aporte</span>
                  <span className="font-bold text-[#00A3B1]">{doc.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Rentabilidade</span>
                  <span className="text-slate-700 font-medium">{doc.yield}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Período</span>
                  <span className="text-slate-700 font-medium">{doc.period}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                <span>Início: {doc.startDate}</span>
                <span>Fim: {doc.endDate}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-[#F8FAFB] border-b border-slate-100">
            <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              {tableHeaders.map((h, i) => (
                <th key={i} className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {h}
                    <div className="flex flex-col opacity-30">
                      <span className="text-[8px] leading-[0.5]">▲</span>
                      <span className="text-[8px] leading-[0.5]">▼</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400 text-sm">
                  Carregando...
                </td>
              </tr>
            ) : contracts.length > 0 ? (
              contracts.map(renderContractRow)
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="max-w-full space-y-10">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Home size={14} className="text-[#00A3B1]" />
          <span className="opacity-50 font-bold">{'>'}</span>
          <span className="text-[#00A3B1] font-bold">Meus documentos</span>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00A3B1] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filtrar por tipo de documento"
            className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      <div className="space-y-12">
        {/* 1. Formulário do investidor */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#002B49]">Formulário do investidor</h2>
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop Header */}
            <div className="hidden sm:grid grid-cols-3 border-b border-slate-50 bg-[#F8FAFB]">
              <div className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nome do Cliente</div>
              <div className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-center">Data de Assinatura</div>
              <div className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-center">Perfil de investidor</div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col sm:grid sm:grid-cols-3 items-start sm:items-center px-6 py-6 gap-6 sm:gap-0 group hover:bg-slate-50 transition-colors">
              <div className="w-full sm:w-auto">
                <span className="block sm:hidden text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Nome do Cliente</span>
                <div className="text-sm text-slate-800 font-bold">{investorData.name}</div>
              </div>

              <div className="w-full sm:w-auto text-left sm:text-center">
                <span className="block sm:hidden text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Data de Assinatura</span>
                <div className="text-sm text-slate-700 font-medium font-mono">{investorData.signatureDate}</div>
              </div>

              <div className="w-full sm:w-auto">
                <span className="block sm:hidden text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Perfil de investidor</span>
                <div className="flex items-center justify-between">
                  <div className="flex-1 sm:flex-none flex justify-start sm:justify-center">
                    <span className="bg-[#E6F6F7] text-[#00A3B1] px-6 py-2 rounded-xl text-sm font-bold border border-[#00A3B1]/10">
                      {investorData.suitabilityProfile}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsInvestorFormOpen(true)}
                    className="p-2 text-slate-300 hover:text-[#00A3B1] hover:bg-[#E6F6F7] rounded-lg transition-all ml-4"
                    title="Visualizar documento"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contratos em processos */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-[#002B49]">Contratos em processos</h2>
            {!loading && emProcessoContracts.length > 0 && (
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                {emProcessoContracts.length}
              </span>
            )}
          </div>
          {renderTable(emProcessoContracts, 'Nenhum contrato em processo no momento.')}
        </div>

        {/* 3. Assinaturas pendentes */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <PenTool size={20} className="text-violet-500" />
            <h2 className="text-lg sm:text-xl font-bold text-[#002B49]">Assinaturas pendentes</h2>
            {!loading && assinandoContracts.length > 0 && (
              <span className="px-3 py-1 bg-violet-50 text-violet-600 text-xs font-bold rounded-full">
                {assinandoContracts.length}
              </span>
            )}
          </div>
          {renderTable(assinandoContracts, 'Nenhuma assinatura pendente no momento.')}
        </div>
      </div>

      {/* Investor Form Modal (KYC) */}
      {isInvestorFormOpen && (
        <KYCDocumentModal
          data={{ ...userProfile, ...fullUserData }}
          onClose={() => setIsInvestorFormOpen(false)}
        />
      )}

      {selectedContract && isContractDetailsOpen && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setIsContractDetailsOpen(false)}
          userProfile={userProfile || investorData}
          role="client"
        />
      )}

    </div>
  );
};

export default DocumentsView;
