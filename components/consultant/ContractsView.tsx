
import React, { useState, useEffect } from 'react';
import {
  Home,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  FileText,
  Calendar as CalendarIcon,
  HelpCircle,
  Eye,
  CheckCircle2,
  X,
  MessageSquare,
  Mail,
  Send,
  RotateCcw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContractModal from '../shared/modals/ContractModal';
import ConsultantContractDetailModal from './modals/ConsultantContractDetailModal';


import ContractStatusBadge from '../shared/ui/ContractStatusBadge';
import { CONTRACT_STATUSES } from '../../lib/contractStatus';
import { calculateContractProjection, ContractSimulation, PaymentInstallment } from '../../lib/financialUtils';
import { format, isValid, parseISO } from 'date-fns';

type ViewMode = 'list' | 'create';

interface ContractsViewProps {
  userProfile?: any;
}

const ContractsView: React.FC<ContractsViewProps> = ({ userProfile }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showClicksignModal, setShowClicksignModal] = useState(false);
  const [clicksignLoading, setClicksignLoading] = useState(false);
  const [lastCreatedContractId, setLastCreatedContractId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string } | null>(null);

  // Data States
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter States
  const [filterClient, setFilterClient] = useState('');
  const [filterConsultor, setFilterConsultor] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCpfCnpj, setFilterCpfCnpj] = useState('');
  const [filterExternalCode, setFilterExternalCode] = useState('');
  const [filterInternalCode, setFilterInternalCode] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [consultors, setConsultors] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    productId: '0001', // Fixed for now
    amount: '',
    rate: '',
    period: '6', // Default to 6 months per example
    startDate: '',
    paymentDay: '10', // Default preference
    sendMethod: 'Whatsapp' as 'Whatsapp' | 'Email' | 'SMS'
  });

  // Simulation State
  const [simulation, setSimulation] = useState<ContractSimulation | null>(null);

  // Client Search State
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    (client.nome_completo || client.email || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
    (client.cpf || '').includes(clientSearch)
  );

  useEffect(() => {
    fetchContracts();
    fetchClients();
    fetchConsultors();
  }, [userProfile]);

  useEffect(() => {
    if (viewMode === 'create') {
      runSimulation();
    }
  }, [formData]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts`);
      if (!response.ok) throw new Error('Falha ao buscar contratos');

      const data = await response.json();
      const contractList = Array.isArray(data) ? data : [];

      const mapped = contractList.map((c: any) => ({
        id: c.codigo || c.id?.substring(0, 6) || '0000',
        extId: c.codigo_externo || '-',
        status: c.status || 'Pendente',
        product: c.titulo || 'Produto',
        amount: c.valor_aporte ? `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(c.valor_aporte)}` : '-',
        yield: c.taxa_mensal ? `${c.taxa_mensal}%` : '-',
        period: c.periodo_meses ? `${c.periodo_meses}` : '-',
        date: c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '-',
        end: c.data_final ? new Date(c.data_final).toLocaleDateString('pt-BR') : '-',
        clientName: c.client_name || '-',
        fullData: c
      })) || [];

      setContracts(mapped);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  /* Clients Fetch - Uses the API endpoint that bypasses RLS */
  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients?limit=200`);
      if (!response.ok) throw new Error('Falha ao buscar clientes');

      const { data: apiData } = await response.json();
      const clientList = Array.isArray(apiData) ? apiData : [];

      console.log('Fetched Clients via API:', { count: clientList.length });

      // Map to a consistent structure
      const mapped = clientList.map((c: any) => ({
        ...c,
        nome_completo: c.nome_fantasia || c.razao_social || c.nome || c.email || 'Sem nome'
      }));

      setClients(mapped);
    } catch (error) {
      console.error("Error fetching clients", error);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchConsultors = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients?limit=500`);
      if (!response.ok) return;
      const { data: apiData } = await response.json();
      const list = Array.isArray(apiData) ? apiData : [];
      // Filter only consultors (tipo_usuario contains 'consultor' or similar)
      const mapped = list.map((c: any) => ({
        ...c,
        nome_completo: c.nome_fantasia || c.razao_social || c.nome || c.email || 'Sem nome'
      }));
      setConsultors(mapped);
    } catch (error) {
      console.error("Error fetching consultors", error);
    }
  };

  // Filtered contracts based on all filters
  const filteredContracts = contracts.filter(c => {
    if (filterClient && !c.clientName?.toLowerCase().includes(filterClient.toLowerCase())) return false;
    if (filterConsultor && c.fullData?.consultor_id !== filterConsultor) return false;
    if (filterProduct && !c.product?.toLowerCase().includes(filterProduct.toLowerCase())) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterCpfCnpj) {
      const cpfCnpj = c.fullData?.cpf || c.fullData?.cnpj || '';
      if (!cpfCnpj.includes(filterCpfCnpj)) return false;
    }
    if (filterExternalCode && !c.extId?.toLowerCase().includes(filterExternalCode.toLowerCase())) return false;
    if (filterInternalCode && !String(c.id).toLowerCase().includes(filterInternalCode.toLowerCase())) return false;
    if (filterDateStart) {
      const startDate = c.fullData?.data_inicio;
      if (startDate && startDate < filterDateStart) return false;
    }
    if (filterDateEnd) {
      const startDate = c.fullData?.data_inicio;
      if (startDate && startDate > filterDateEnd) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterClient('');
    setFilterConsultor('');
    setFilterProduct('');
    setFilterStatus('');
    setFilterCpfCnpj('');
    setFilterExternalCode('');
    setFilterInternalCode('');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  // Format number as BRL currency: 1.000,00
  const formatCurrency = (value: string): string => {
    // Remove tudo exceto dígitos
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    // Converte centavos para reais
    const cents = parseInt(digits, 10);
    const reais = (cents / 100).toFixed(2);
    // Formata com separador de milhar e vírgula decimal
    const [intPart, decPart] = reais.split('.');
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted},${decPart}`;
  };

  // Format decimal: permite apenas dígitos e vírgula, max 2 casas decimais
  const formatDecimal = (value: string): string => {
    // Permite apenas dígitos e vírgula
    let clean = value.replace(/[^\d,]/g, '');
    // Só permite uma vírgula
    const parts = clean.split(',');
    if (parts.length > 2) {
      clean = parts[0] + ',' + parts.slice(1).join('');
    }
    // Limita a 2 casas decimais
    if (parts.length === 2 && parts[1].length > 2) {
      clean = parts[0] + ',' + parts[1].substring(0, 2);
    }
    return clean;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'amount') {
      setFormData(prev => ({ ...prev, [field]: formatCurrency(value) }));
    } else if (field === 'rate') {
      setFormData(prev => ({ ...prev, [field]: formatDecimal(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const runSimulation = () => {
    // Basic validation
    // Parse Amount (remove R$, dots, replace comma)
    const amountStr = formData.amount.replace(/[^\d,]/g, '').replace(',', '.');
    const amount = parseFloat(amountStr);

    // Parse Rate
    const rateStr = formData.rate.replace(',', '.');
    const rate = parseFloat(rateStr);

    const period = parseInt(formData.period);
    const paymentDay = parseInt(formData.paymentDay);
    const startDate = formData.startDate; // yyyy-mm-dd

    if (!amount || !rate || !period || !startDate || !isValid(parseISO(startDate))) {
      setSimulation(null);
      return;
    }

    // Consultant Limits & Margins Check
    // Max Margin 2%. Consultant Profit = 2% - Client Rate.
    // If rate > 2%, Error or warning? Assuming logic blocks or warns.
    const maxRate = 2.0;
    const consultantMargin = Math.max(0, maxRate - rate);
    const leaderRate = 0.10; // Fixed per requirement

    const result = calculateContractProjection(
      amount,
      rate,
      startDate,
      period,
      paymentDay,
      consultantMargin,
      leaderRate
    );

    setSimulation(result);
  };

  const handleCreateContract = async () => {
    if (!simulation || !formData.clientId) return;
    setSubmitting(true);

    try {
      const amountStr = formData.amount.replace(/[^\d,]/g, '').replace(',', '.');
      const amount = parseFloat(amountStr);
      const rateStr = formData.rate.replace(',', '.');
      const rate = parseFloat(rateStr);
      const maxRate = 2.0;
      const consultantRateVal = Math.max(0, maxRate - rate);

      // 1. Create Contract via API
      const contractPayload = {
        user_id: formData.clientId,
        consultor_id: userProfile?.id,
        titulo: 'Câmbio',
        valor_aporte: amount,
        taxa_mensal: rate,
        taxa_consultor: consultantRateVal,
        taxa_lider: 0.10,
        periodo_meses: parseInt(formData.period),
        data_inicio: formData.startDate,
        dia_pagamento: parseInt(formData.paymentDay),
        preferencia_assinatura: formData.sendMethod,
        status: 'Rascunho'
      };

      const contractRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractPayload)
      });

      if (!contractRes.ok) {
        const errData = await contractRes.json();
        throw new Error(errData.error || 'Falha ao criar contrato');
      }

      const contractData = await contractRes.json();

      // 2. Create Payment Schedule via API
      // All objects must have the same keys for PostgREST bulk insert (PGRST102)
      const paymentsToInsert = [
        ...simulation.clientPayments.map(p => ({
          contrato_id: contractData.id,
          cliente_id: formData.clientId,
          consultor_id: userProfile?.id || null,
          data: p.date,
          valor: p.amount,
          evento: p.description,
          dividendos_clientes: true,
          comissao_consultor: false,
          comissao_consultor_lider: false
        })),
        ...simulation.consultantCommissions.map(p => ({
          contrato_id: contractData.id,
          cliente_id: formData.clientId,
          consultor_id: userProfile?.id || null,
          data: p.date,
          valor: p.amount,
          evento: 'Comissão Consultor',
          dividendos_clientes: false,
          comissao_consultor: true,
          comissao_consultor_lider: false
        })),
        ...simulation.leaderCommissions.map(p => ({
          contrato_id: contractData.id,
          cliente_id: formData.clientId,
          consultor_id: userProfile?.id || null,
          data: p.date,
          valor: p.amount,
          evento: 'Comissão Líder',
          dividendos_clientes: false,
          comissao_consultor: false,
          comissao_consultor_lider: true
        }))
      ];

      const calendarRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/calendar-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payments: paymentsToInsert })
      });

      if (!calendarRes.ok) {
        const errData = await calendarRes.json();
        throw new Error(errData.error || 'Falha ao criar pagamentos');
      }

      setLastCreatedContractId(contractData.id);
      setShowClicksignModal(true);
      fetchContracts();
    } catch (error: any) {
      console.error("Error creating contract:", error);
      alert(`Erro ao criar contrato: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClicksignConfirm = async () => {
    if (!lastCreatedContractId) return;
    setClicksignLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clicksign/send-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: lastCreatedContractId, sendMethod: formData.sendMethod })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao enviar para assinatura');
      }

      setShowClicksignModal(false);
      setShowSuccessModal(true);
      setViewMode('list');
      fetchContracts();
    } catch (error: any) {
      console.error('Clicksign error:', error);
      alert(`Erro ao enviar para assinatura: ${error.message}`);
    } finally {
      setClicksignLoading(false);
    }
  };

  const handleClicksignCancel = () => {
    setShowClicksignModal(false);
    setLastCreatedContractId(null);
    setViewMode('list');
    fetchContracts();
  };

  const handleDeleteContract = async (contractId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao excluir contrato');
      }
      fetchContracts();
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      alert(`Erro ao excluir contrato: ${error.message}`);
    }
  };



  const userClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <button onClick={() => setViewMode('list')} className={`font-bold transition-colors ${viewMode === 'list' ? 'text-[#00A3B1]' : 'hover:text-[#00A3B1]'}`}>Contratos</button>
        {viewMode === 'create' && (
          <>
            <span className="opacity-50 font-bold">{'>'}</span>
            <span className="text-[#00A3B1] font-bold">Cadastrar contrato</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002B49]">{viewMode === 'list' ? 'Contratos' : 'Cadastrar contrato'}</h2>
        {viewMode === 'list' && (
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
          >
            <FileText size={18} />
            Cadastrar novo contrato
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter Form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#002B49]">Pesquisar contrato</h3>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#00A3B1] transition-colors"
                >
                  <RotateCcw size={12} />
                  Limpar filtros
                </button>
              </div>

              {/* Row 1: Cliente, Consultor, Produto */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Cliente</label>
                  <select
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  >
                    <option value="">Selecione o cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.nome_completo}>{c.nome_completo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Consultor</label>
                  <select
                    value={filterConsultor}
                    onChange={(e) => setFilterConsultor(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  >
                    <option value="">Selecione o consultor</option>
                    {consultors.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome_completo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Produto</label>
                  <select
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  >
                    <option value="">Selecione o produto</option>
                    <option value="FNCD Renda Fixa">FNCD Renda Fixa</option>
                    <option value="FNCD Renda Variável">FNCD Renda Variável</option>
                    <option value="FNCD Capital">FNCD Capital</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Status, CPF/CNPJ, Código externo, Código contrato */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Status do contrato</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  >
                    <option value="">Selecionar status</option>
                    {CONTRACT_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="CPF ou CNPJ"
                    value={filterCpfCnpj}
                    onChange={(e) => setFilterCpfCnpj(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Código do contrato (externo)</label>
                  <input
                    type="text"
                    placeholder=""
                    value={filterExternalCode}
                    onChange={(e) => setFilterExternalCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Código do contrato</label>
                  <input
                    type="text"
                    placeholder=""
                    value={filterInternalCode}
                    onChange={(e) => setFilterInternalCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Datas de Aporte */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Aporte (início)<span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002B49]">Aporte (fim)<span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#002B49]">Contratos ({filteredContracts.length})</h3>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-[#F8FAFB] border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="px-6 py-4">Cód. contrato</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aporte</th>
                      <th className="px-6 py-4">Rentabilidade</th>
                      <th className="px-6 py-4">Início</th>
                      <th className="px-6 py-4">Fim</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={8} className="p-8 text-center text-slate-400">Carregando...</td></tr>
                    ) : filteredContracts.map((c, i) => (
                      <tr key={i} onClick={() => setSelectedContract(c.fullData)} className="text-sm hover:bg-slate-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-5 font-bold text-[#002B49]">{c.id}</td>
                        <td className="px-6 py-5 text-slate-600">{c.fullData?.usuarios?.nome_completo || '-'}</td>
                        <td className="px-6 py-5"><ContractStatusBadge status={c.status} /></td>
                        <td className="px-6 py-5 text-[#002B49] font-bold">{c.amount}</td>
                        <td className="px-6 py-5 text-slate-500">{c.yield}</td>
                        <td className="px-6 py-5 text-slate-400">{c.date}</td>
                        <td className="px-6 py-5 text-slate-400">{c.end}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            {c.status === 'Rascunho' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ id: c.fullData?.id || c.id, code: c.id });
                                  }}
                                  title="Excluir contrato"
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLastCreatedContractId(c.fullData?.id || c.id);
                                    setShowClicksignModal(true);
                                  }}
                                  title="Enviar para assinatura"
                                  className="p-2 text-[#00A3B1] hover:text-[#008c99] hover:bg-cyan-50 rounded-lg transition-colors"
                                >
                                  <Send size={16} />
                                </button>
                              </>
                            )}


                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredContracts.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-slate-400">Nenhum contrato encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm space-y-12"
          >
            {/* Preference Section */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-[#002B49] tracking-wide">Preferência de envio de link de assinatura</label>
              <div className="flex gap-4 p-1 bg-[#F8FAFB] w-fit rounded-xl border border-slate-100">
                {['Whatsapp', 'Email', 'SMS'].map((method) => (
                  <button
                    key={method}
                    onClick={() => handleInputChange('sendMethod', method)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.sendMethod === method
                      ? 'bg-white text-[#27C27B] shadow-sm border border-slate-100'
                      : 'text-slate-400 hover:text-[#002B49]'
                      }`}
                  >
                    {method === 'Whatsapp' && <MessageSquare size={18} />}
                    {method === 'Email' && <Mail size={18} />}
                    {method === 'SMS' && <Send size={18} />}
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Select */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Informações do cliente</h3>
              <div className="space-y-2 relative">
                <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Cliente <span className="text-[#00A3B1]">*</span></label>

                <div className="relative z-30">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Digite o nome, email ou CPF para buscar..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setShowClientDropdown(true);
                        if (formData.clientId && e.target.value === '') handleInputChange('clientId', '');
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]"
                    />
                    <ChevronRight
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition-transform ${showClientDropdown ? 'rotate-90' : 'rotate-0'}`}
                      size={16}
                    />
                  </div>

                  {showClientDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowClientDropdown(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20 divide-y divide-slate-50">
                        {clientsLoading && <div className="p-4 text-xs text-slate-400">Carregando clientes...</div>}
                        {!clientsLoading && clients.length === 0 && <div className="p-4 text-xs text-slate-400">Nenhum cliente disponível.</div>}
                        {!clientsLoading && clients.length > 0 && filteredClients.length === 0 && (
                          <div className="p-4 text-xs text-slate-400">Nenhum cliente encontrado com este termo.</div>
                        )}
                        {filteredClients.map(client => (
                          <button
                            key={client.id}
                            onClick={() => {
                              handleInputChange('clientId', client.id);
                              setClientSearch(client.nome_completo || client.email);
                              setShowClientDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#F8FAFB] transition-colors flex flex-col gap-0.5"
                          >
                            <span className="text-sm font-bold text-[#002B49]">{client.nome_completo || 'Sem nome'}</span>
                            <span className="text-xs text-slate-400">{client.email} • {client.cpf || 'Sem CPF'}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {userClient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-8 border border-[#E6F6F7] rounded-3xl bg-white grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden"
                >
                  <div className="space-y-6">
                    <Field label="Nome" value={userClient.nome_completo || '-'} />
                    <Field label="CPF" value={userClient.cpf || '-'} />
                    <Field label="Contato" value={userClient.celular || userClient.email || '-'} />
                  </div>
                  <div className="space-y-6">
                    <Field label="Banco" value={userClient.banco || '-'} />
                    <Field label="Agência" value={userClient.agencia_bancaria || '-'} />
                    <Field label="Conta" value={userClient.conta_bancaria || '-'} />
                  </div>
                  {/* Warning Box */}
                  <div className="mt-8 p-6 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl space-y-2 col-span-1 md:col-span-3">
                    <p className="text-[11px] font-bold text-[#92400E] uppercase tracking-wider">Atenção:</p>
                    <p className="text-[10px] text-[#B45309] font-medium leading-relaxed">Verifique se os dados do cliente estão atualizados antes de prosseguir.</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Product & Financial Section */}
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Produto <span className="text-[#00A3B1]">*</span></label>
                <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]">
                  <option value="0001">0001 - Câmbio</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Aporte <span className="text-[#00A3B1]">*</span></label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</div>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Rentabilidade <span className="text-[#00A3B1]">*</span></label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-medium">% a.m.</div>
                    <input
                      type="text"
                      placeholder="0.0"
                      value={formData.rate}
                      onChange={(e) => handleInputChange('rate', e.target.value)}
                      className="w-full pl-16 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Data Início <span className="text-[#00A3B1]">*</span></label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Período <span className="text-[#00A3B1]">*</span></label>
                  <select
                    value={formData.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold appearance-none focus:ring-2 focus:ring-[#00A3B1]/10"
                  >
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                    <option value="18">18 meses</option>
                    <option value="24">24 meses</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Simulation Results */}
            {simulation && (
              <>
                {/* Summary Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Rend. Mensal', val: `R$ ${simulation.summary.monthlyDividend.toFixed(2)}`, color: 'text-[#00A3B1]' },
                    { label: 'Dia Pagamento', val: formData.paymentDay, color: 'text-[#00A3B1]' },
                    { label: 'Primeiro Pagto', val: format(parseISO(simulation.summary.firstPaymentDate), 'dd/MM/yyyy'), color: 'text-[#00A3B1]' },
                    { label: 'Fim do Contrato', val: format(parseISO(simulation.summary.endDate), 'dd/MM/yyyy'), color: 'text-[#00A3B1]' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-left space-y-1">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{item.label}</p>
                      <p className={`text-sm font-bold ${item.color}`}>{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Installments Table */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-[#F8FAFB] border-b border-slate-100 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-[#002B49]">Simulação de Pagamentos (Cliente)</h4>
                    <span className="text-xs font-bold text-slate-400">Total: R$ {simulation.summary.totalDividend.toFixed(2)}</span>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-50">
                      <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {simulation.clientPayments.map((row, i) => (
                        <tr key={i} className="text-sm">
                          <td className="px-6 py-4 text-[#002B49] font-bold">{format(parseISO(row.date), 'dd/MM/yyyy')}</td>
                          <td className="px-6 py-4 text-slate-500">{row.description}</td>
                          <td className="px-6 py-4 text-slate-500">
                            <span className={`px-2 py-1 rounded text-[10px] border ${row.type === 'Pro-rata' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              row.type === 'Capital Return' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-green-50 text-green-600 border-green-100'
                              }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#002B49] font-medium text-right">R$ {row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setViewMode('list')}
                className="px-10 py-4 text-slate-400 font-bold text-sm hover:text-[#002B49] transition-colors border border-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateContract}
                disabled={submitting || !simulation}
                className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
              >
                {submitting ? 'Salvando...' : 'Enviar contrato'}
                {!submitting && <CheckCircle2 size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContractSuccessModal isOpen={showSuccessModal} onClose={() => {
        setShowSuccessModal(false);
        setViewMode('list');
        // Reset form
        setFormData({
          clientId: '',
          productId: '0001',
          amount: '',
          rate: '',
          period: '6',
          startDate: '',
          paymentDay: '10',
          sendMethod: 'Whatsapp'
        });
        setSimulation(null);
      }} />


      {/* Clicksign Confirmation Modal */}
      <ClicksignConfirmModal
        isOpen={showClicksignModal}
        onConfirm={handleClicksignConfirm}
        onCancel={handleClicksignCancel}
        loading={clicksignLoading}
      />

      {/* Success Modal */}
      <ContractSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setLastCreatedContractId(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#002B49] mb-2">Excluir contrato</h3>
                <p className="text-slate-500 mb-1">Tem certeza que deseja excluir o contrato</p>
                <p className="text-[#002B49] font-bold text-lg mb-2">#{deleteConfirm.code}?</p>
                <p className="text-sm text-slate-400 mb-8">Esta ação não poderá ser desfeita.</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 px-6 bg-white border-2 border-slate-200 hover:border-slate-300 text-[#002B49] font-semibold rounded-xl transition-all active:scale-[0.97]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteContract(deleteConfirm.id);
                      setDeleteConfirm(null);
                    }}
                    className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-red-500/25"
                  >
                    Sim, excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Contract Detail Modal (Consultant Version) */}
      {selectedContract && (
        <ConsultantContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          role="consultant"
        />
      )}
    </div>
  );
};

const Field = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{label}:</p>
    <p className="text-sm font-bold text-[#002B49]">{value}</p>
  </div>
);

const ContractSuccessModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={20} /></button>
        <div className="w-20 h-20 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6F6F7]/50">
          <CheckCircle2 className="text-[#00A3B1]" size={36} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">Contrato enviado!</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">O contrato foi enviado para assinatura digital com sucesso. Os signatários receberão um e-mail com o link para assinar.</p>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98]">Fechar</button>
      </motion.div>
    </div>
  );
};

const ClicksignConfirmModal = ({ isOpen, onConfirm, onCancel, loading }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void; loading: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6F6F7]/50">
          <Send className="text-[#00A3B1]" size={36} />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">Deseja realmente enviar este contrato?</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Ao confirmar, o contrato será enviado para a assinatura digital. Deseja prosseguir?
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RotateCcw size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar Contrato'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-[#002B49] font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-40"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ContractsView;
