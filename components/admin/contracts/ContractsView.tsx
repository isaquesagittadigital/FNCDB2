import React, { useState } from 'react';
import { Plus, Home, ChevronRight, Search, Trash2, Edit2, ArrowUpDown, Eye, RotateCcw, X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContractForm from './ContractForm';
import ContractDetailModal from '../../shared/ContractDetailModal';
import ContractStatusBadge from '../../shared/ui/ContractStatusBadge';
import { CONTRACT_STATUSES } from '../../../lib/contractStatus';
import SimulatorView from '../../simulator/SimulatorView';
import { calculateContractProjection } from '../../../lib/financialUtils';
import SendContractConfirmationModal from '../../shared/modals/SendContractConfirmationModal';

const ContractsView = ({ userProfile }: { userProfile?: any }) => {
    // Mock data based on the image provided
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [feedbackModal, setFeedbackModal] = useState<{ type: 'success' | 'error' | 'warning'; title: string; message: string } | null>(null);

    // Clicksign Flow States
    const [showClicksignModal, setShowClicksignModal] = useState(false);
    const [clicksignLoading, setClicksignLoading] = useState(false);
    const [lastCreatedContractId, setLastCreatedContractId] = useState<string | null>(null);
    const [contractSendMethod, setContractSendMethod] = useState<'Email' | 'Whatsapp' | 'SMS'>('Email');
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

    const [clients, setClients] = useState<any[]>([]);
    const [consultors, setConsultors] = useState<any[]>([]);

    React.useEffect(() => {
        if (viewMode === 'list') {
            fetchContracts();
            fetchClients();
            fetchConsultors();
        }
    }, [viewMode]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/contracts`);
            if (res.ok) {
                const data = await res.json();
                const contractList = Array.isArray(data) ? data : [];
                const mapped = contractList.map((c: any) => ({
                    id: c.codigo || c.id?.substring(0, 6) || '0000',
                    extId: c.codigo_externo || '-',
                    status: c.status || 'Pendente',
                    product: c.titulo || 'Produto',
                    amount: c.valor_aporte ? `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(c.valor_aporte)}` : '-',
                    yield: c.taxa_mensal ? `${c.taxa_mensal}%` : '-',
                    period: c.periodo_meses ? `${c.periodo_meses}` : '-',
                    date: c.data_inicio ? new Date(c.data_inicio + 'T12:00:00Z').toLocaleDateString('pt-BR') : '-',
                    end: (c.data_fim || c.data_final) ? new Date((c.data_fim || c.data_final) + 'T12:00:00Z').toLocaleDateString('pt-BR') : (
                        c.data_inicio && c.periodo_meses ? new Date(new Date(c.data_inicio + 'T12:00:00Z').setMonth(new Date(c.data_inicio + 'T12:00:00Z').getMonth() + parseInt(c.periodo_meses))).toLocaleDateString('pt-BR') : '-'
                    ),
                    clientName: c.client_name || '-',
                    clientCpf: c.client_cpf || c.client_cnpj || '',
                    consultorId: c.consultor_id || '',
                    fullData: c
                }));
                setContracts(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch contracts", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/clients?limit=200`);
            if (!response.ok) throw new Error('Falha ao buscar clientes');
            const data = await response.json();
            if (Array.isArray(data)) {
                setClients(data.map(c => ({
                    id: c.id,
                    nome_completo: c.nome_fantasia || c.razao_social || c.nome || 'Sem Nome',
                    cpf: c.cnpj || c.cpf
                })));
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchConsultors = async () => {
        try {
            const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/consultants`);
            if (!response.ok) throw new Error('Falha ao buscar consultores');
            const data = await response.json();
            if (Array.isArray(data)) {
                setConsultors(data.map(c => ({
                    id: c.id,
                    nome_completo: c.nome_fantasia || c.razao_social || c.nome
                })));
            }
        } catch (error) {
            console.error("Error fetching consultors:", error);
        }
    };

    const handleCreate = () => {
        setSelectedId(null);
        setViewMode('create');
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        setViewMode('edit');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return;
        try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/contracts/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchContracts();
                setFeedbackModal({ type: 'success', title: 'Contrato excluído', message: 'O contrato foi excluído com sucesso.' });
            } else {
                setFeedbackModal({ type: 'error', title: 'Erro', message: 'Não foi possível excluir o contrato.' });
            }
        } catch (error) {
            console.error(error);
            setFeedbackModal({ type: 'error', title: 'Erro', message: 'Não foi possível excluir o contrato.' });
        }
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedId(null);
    };

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

    // Filter logic
    const filteredContracts = contracts.filter(c => {
        const matchesClient = filterClient ? c.clientName === filterClient : true;
        const matchesConsultor = filterConsultor ? c.consultorId === filterConsultor : true;
        const matchesProduct = filterProduct ? c.product === filterProduct : true;
        const matchesStatus = filterStatus ? c.status === filterStatus : true;
        const matchesCpfCnpj = filterCpfCnpj ? (c.clientCpf || '').replace(/\D/g, '').includes(filterCpfCnpj.replace(/\D/g, '')) : true;
        const matchesExtCode = filterExternalCode ? (c.extId && c.extId.includes(filterExternalCode)) : true;
        const matchesIntCode = filterInternalCode ? c.id.includes(filterInternalCode) : true;

        let matchesDateStart = true;
        if (filterDateStart && c.fullData?.data_inicio) {
            matchesDateStart = new Date(c.fullData.data_inicio) >= new Date(filterDateStart);
        }

        let matchesDateEnd = true;
        if (filterDateEnd && c.fullData?.data_inicio) {
            matchesDateEnd = new Date(c.fullData.data_inicio) <= new Date(filterDateEnd);
        }

        return matchesClient && matchesConsultor && matchesProduct && matchesStatus &&
            matchesCpfCnpj && matchesExtCode && matchesIntCode && matchesDateStart && matchesDateEnd;
    });

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
                // Admin doesn't necessarily have a consultant ID, but we can send userProfile.id if needed, or null
                consultor_id: userProfile?.tipo_user === 'Consultor' ? userProfile.id : null,
                titulo: '0001 - Câmbio',
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

            const contractRes = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/contracts`, {
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

            const calendarRes = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/calendar-payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payments: paymentsToInsert })
            });

            if (!calendarRes.ok) {
                const errData = await calendarRes.json();
                throw new Error(errData.error || 'Falha ao criar pagamentos');
            }

            // Instead of sending directly, we now open the confirmation modal
            setLastCreatedContractId(contractData.id);
            setContractSendMethod(sendMethod);
            setShowClicksignModal(true);

            setViewMode('list');
            fetchContracts();
        } catch (error: any) {
            console.error("Error creating contract:", error);
            setFeedbackModal({ type: 'error', title: 'Erro ao criar contrato', message: error.message || 'Ocorreu um erro inesperado. Tente novamente.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClicksignConfirm = async () => {
        if (!lastCreatedContractId) return;
        setClicksignLoading(true);

        try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/clicksign/send-contract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId: lastCreatedContractId,
                    sendMethod: contractSendMethod
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Falha ao enviar para assinatura');
            }

            setShowClicksignModal(false);
            setFeedbackModal({
                type: 'success',
                title: 'Contrato enviado!',
                message: 'O contrato foi enviado para assinatura digital com sucesso. Os signatários receberão uma notificação com o link para assinar.'
            });
            fetchContracts();
        } catch (error: any) {
            console.error('Clicksign error:', error);
            setFeedbackModal({
                type: 'error',
                title: 'Erro ao enviar',
                message: error.message || 'Falha ao enviar para assinatura.'
            });
        } finally {
            setClicksignLoading(false);
        }
    };

    const handleClicksignCancel = () => {
        setShowClicksignModal(false);
        setLastCreatedContractId(null);
        setFeedbackModal({
            type: 'success',
            title: 'Contrato salvo',
            message: 'O contrato foi salvo como rascunho com sucesso.'
        });
    };

    if (viewMode === 'create') {
        return (
            <motion.div
                key="create"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full relative z-10 p-2"
            >
                <ContractForm
                    contractId={null}
                    onBack={handleBack}
                    onSave={fetchContracts}
                    userProfile={userProfile}
                    onSubmitDetails={handleCreateFromSimulator}
                />
            </motion.div>
        );
    }

    if (viewMode === 'edit') {
        // Assume ContractForm is imported (must add import if missing)
        return (
            <ContractForm
                contractId={selectedId}
                onBack={handleBack}
                onSave={fetchContracts} // Callback to refresh list
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Breadcrumbs and Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium">Contratos</span>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="bg-[#009BB6] hover:bg-[#008f9e] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    Cadastrar novo contrato
                </button>
            </div>

            <h1 className="text-2xl font-bold text-[#002B49]">Contratos</h1>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <option value="0001 - Câmbio">0001 - Câmbio</option>
                            <option value="0002 - Recebíveis (Em Breve)">0002 - Recebíveis (Em Breve)</option>
                            <option value="0003 - Consignado (Em Breve)">0003 - Consignado (Em Breve)</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Status, CPF/CNPJ, Código externo, Código contrato */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                                            <button
                                                onClick={() => setSelectedContract(c.fullData)}
                                                className="text-slate-400 hover:text-cyan-600 transition-colors"
                                                title="Ver contrato"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(c.fullData?.id || c.id)}
                                                className="text-slate-400 hover:text-cyan-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {c.status === 'Rascunho' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(c.fullData?.id || c.id);
                                                        }}
                                                        title="Excluir contrato"
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
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

            {/* Contract Detail Modal */}
            {selectedContract && (
                <ContractDetailModal
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            )}

            {/* Feedback Modal */}
            <FeedbackModal
                data={feedbackModal}
                onClose={() => setFeedbackModal(null)}
            />

            {/* Clicksign Confirmation Modal */}
            <SendContractConfirmationModal
                isOpen={showClicksignModal}
                onConfirm={handleClicksignConfirm}
                onCancel={handleClicksignCancel}
                loading={clicksignLoading}
            />
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
