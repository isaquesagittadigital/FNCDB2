
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
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContractModal from '../shared/modals/ContractModal';
import SimulatorView from '../simulator/SimulatorView';
import ContractForm from '../admin/contracts/ContractForm';

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

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ type: 'success' | 'error' | 'warning'; title: string; message: string } | null>(null);

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

  const formatCurrency = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const cents = parseInt(digits, 10);
    const reais = (cents / 100).toFixed(2);
    const [intPart, decPart] = reais.split('.');
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted},${decPart}`;
  };

  const formatDecimal = (value: string): string => {
    let clean = value.replace(/[^\d,]/g, '');
    const parts = clean.split(',');
    if (parts.length > 2) {
      clean = parts[0] + ',' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      clean = parts[0] + ',' + parts[1].substring(0, 2);
    }

    // Check consultant max limit if needed here, or handle in onChange
    return clean;
  };

  // Helper to ensure decimal fits max allowed contract percentage
  const handleRateChange = (value: string) => {
    const formatted = formatDecimal(value);
    const numValue = parseFloat(formatted.replace(',', '.'));
    const maxAllowed = userProfile?.percentual_contrato ?? 2.0;

    if (!isNaN(numValue) && numValue > maxAllowed) {
      setFormData(prev => ({ ...prev, rate: maxAllowed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
    } else {
      setFormData(prev => ({ ...prev, rate: formatted }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'amount') {
      setFormData(prev => ({ ...prev, [field]: formatCurrency(value) }));
    } else if (field === 'rate') {
      handleRateChange(value);
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

  const handleCreateFromSimulator = async (data: any) => {
    if (!data.clientId) return;
    setSubmitting(true);

    try {
      const { amount, rate, period, startDate, paymentDay, sendMethod, clientId } = data;
      const maxRate = 2.0;
      const consultantRateVal = Math.max(0, maxRate - rate);

      // 1. Create Contract via API
      const contractPayload = {
        user_id: clientId,
        consultor_id: userProfile?.id,
        titulo: 'Câmbio',
        valor_aporte: amount,
        taxa_mensal: rate,
        taxa_consultor: consultantRateVal,
        taxa_lider: 0.10,
        periodo_meses: period,
        data_inicio: startDate,
        dia_pagamento: paymentDay,
        preferencia_assinatura: sendMethod,
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

      // Ensure we hit the financial calculation for the exact backend calendar structure
      const simResult = calculateContractProjection(
        amount,
        rate,
        startDate,
        period,
        paymentDay,
        consultantRateVal,
        0.10 // leaderRate
      );

      // 2. Create Payment Schedule via API
      const paymentsToInsert = [
        ...simResult.clientPayments.map(p => ({
          contrato_id: contractData.id,
          cliente_id: clientId,
          consultor_id: userProfile?.id || null,
          data: p.date,
          valor: p.amount,
          evento: p.description,
          dividendos_clientes: true,
          comissao_consultor: false,
          comissao_consultor_lider: false
        })),
        ...simResult.consultantCommissions.map(p => ({
          contrato_id: contractData.id,
          cliente_id: clientId,
          consultor_id: userProfile?.id || null,
          data: p.date,
          valor: p.amount,
          evento: 'Comissão Consultor',
          dividendos_clientes: false,
          comissao_consultor: true,
          comissao_consultor_lider: false
        })),
        ...simResult.leaderCommissions.map(p => ({
          contrato_id: contractData.id,
          cliente_id: clientId,
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
      setFeedbackModal({ type: 'error', title: 'Erro ao criar contrato', message: error.message || 'Ocorreu um erro inesperado.' });
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
      setFeedbackModal({ type: 'error', title: 'Erro ao enviar', message: error.message || 'Falha ao enviar para assinatura.' });
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
      setFeedbackModal({ type: 'error', title: 'Erro ao excluir', message: error.message || 'Falha ao excluir contrato.' });
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
                      <tr key={i} className="text-sm hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5 font-bold text-[#002B49]">{c.id}</td>
                        <td className="px-6 py-5 text-slate-600">{c.clientName || '-'}</td>
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full relative z-10 p-2"
          >
            <ContractForm
              contractId={null}
              onBack={() => setViewMode('list')}
              onSave={fetchContracts}
              userProfile={userProfile}
            />
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



      {/* Feedback Modal */}
      <FeedbackModal
        data={feedbackModal}
        onClose={() => setFeedbackModal(null)}
      />

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

/** Styled feedback modal replacing native alert() */
const FeedbackModal = ({ data, onClose }: { data: { type: 'success' | 'error' | 'warning'; title: string; message: string } | null; onClose: () => void }) => {
  if (!data) return null;

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-50', ring: 'ring-emerald-100', iconColor: 'text-emerald-500', btnBg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' },
    error: { icon: XCircle, bg: 'bg-red-50', ring: 'ring-red-100', iconColor: 'text-red-500', btnBg: 'bg-red-500 hover:bg-red-600 shadow-red-500/25' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50', ring: 'ring-amber-100', iconColor: 'text-amber-500', btnBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' },
  }[data.type];

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute right-5 top-5 text-slate-300 hover:text-slate-500 transition-colors">
            <X size={18} />
          </button>
          <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mx-auto ring-8 ${config.ring}`}>
            <Icon className={config.iconColor} size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#002B49]">{data.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{data.message}</p>
          </div>
          <button
            onClick={onClose}
            className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${config.btnBg}`}
          >
            Fechar
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContractsView;
