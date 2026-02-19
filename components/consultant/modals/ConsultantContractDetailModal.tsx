import React, { useState, useEffect } from 'react';
import { X, Eye, Upload, CheckCircle2, Clock, AlertCircle, FileText, DollarSign, User, Building2, ClipboardList, Paperclip, TrendingUp, Download, Loader2, Trash2, ExternalLink, Calendar, ShieldCheck, AlertTriangle, FileImage, File, RefreshCw, ArrowRight, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import UploadComprovanteModal from '../../shared/UploadComprovanteModal';
import ContractStatusBadge from '../../shared/ui/ContractStatusBadge';
import RenewalConfirmModal from '../../shared/modals/RenewalConfirmModal';
import RenewalViewModal from '../../shared/modals/RenewalViewModal';
import RedeemRequestModal from '../../shared/modals/RedeemRequestModal';
import RedeemViewModal from '../../shared/modals/RedeemViewModal';
import KYCDocumentModal from '../../shared/KYCDocumentModal';

export type ContractModalRole = 'client' | 'consultant' | 'admin';

interface Comprovante {
    id: string;
    contrato_id: string;
    arquivo_url: string;
    arquivo_nome: string;
    data_transferencia: string | null;
    created_at: string;
}

interface ContractDetailModalProps {
    contract: any;
    onClose: () => void;
    /** Optional: used for displaying client info when viewing as client */
    userProfile?: any;
    /** Role determines which features are visible. Defaults to 'consultant' for this modal */
    role?: ContractModalRole;
}

/* ── Custom Confirm Dialog ── */
const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Excluir',
    cancelLabel = 'Cancelar',
    loading = false,
    danger = true,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#002B49]/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
                {/* Top accent */}
                <div className={`h-1 w-full ${danger ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-[#00A3B1] to-[#00c4d4]'}`} />

                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-[#E6F6F7]'}`}>
                            <AlertTriangle className={danger ? 'text-red-500' : 'text-[#00A3B1]'} size={22} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#002B49]">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 ${danger
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
                                : 'bg-[#00A3B1] hover:bg-[#008c99] shadow-lg shadow-[#00A3B1]/20'
                                }`}
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ── Main Modal ── */
const ConsultantContractDetailModal: React.FC<ContractDetailModalProps> = ({ contract, onClose, userProfile, role = 'consultant' }) => {
    const [clientData, setClientData] = useState<any>(null);
    const [consultorData, setConsultorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [viewingPdf, setViewingPdf] = useState(false);
    const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
    const [loadingComprovantes, setLoadingComprovantes] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [showRenewalSuccess, setShowRenewalSuccess] = useState(false);
    const [showRenewalView, setShowRenewalView] = useState(false);
    const [existingRenewal, setExistingRenewal] = useState<any>(null);
    const [loadingRenewal, setLoadingRenewal] = useState(false);
    const [existingRedeem, setExistingRedeem] = useState<any>(null);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [showRedeemView, setShowRedeemView] = useState(false);
    const [showKYCModal, setShowKYCModal] = useState(false);

    const isClient = role === 'client';
    const isAdmin = role === 'admin';
    const isConsultant = role === 'consultant';
    const canManageComprovantes = isAdmin || isConsultant;

    useEffect(() => {
        if (contract) {
            fetchRelatedData();
            if (canManageComprovantes) {
                fetchComprovantes();
            }
            // Fetch renewal and redeem status for all roles
            fetchExistingRenewal();
            fetchExistingRedeem();
        }
    }, [contract]);

    const fetchExistingRenewal = async () => {
        setLoadingRenewal(true);
        try {
            const { data, error } = await supabase
                .from('renovacoes')
                .select('*')
                .eq('contrato_id', contract.id)
                .order('data_solicitacao', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                setExistingRenewal(data);
            }
        } catch (err) {
            console.error('Error fetching renewal:', err);
        } finally {
            setLoadingRenewal(false);
        }
    };

    const fetchRelatedData = async () => {
        setLoading(true);
        try {
            if (isClient && userProfile) {
                // For client role, we already have the profile and only need consultant
                setClientData(userProfile);
                if (contract.consultor_id) {
                    const { data: consultant } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', contract.consultor_id)
                        .single();
                    setConsultorData(consultant);
                } else if (userProfile?.consultant_id) {
                    const { data: consultant } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', userProfile.consultant_id)
                        .single();
                    setConsultorData(consultant);
                }

                // Calculate installments for client view
                calculateInstallments();
            } else {
                // Admin/Consultant: fetch from API (bypasses RLS)
                if (contract.user_id) {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients?limit=500`);
                        if (res.ok) {
                            const { data } = await res.json();
                            const client = data?.find((c: any) => c.id === contract.user_id);
                            if (client) setClientData(client);
                        }
                    } catch (e) { console.error('Error fetching client', e); }
                }

                if (contract.consultor_id) {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients?limit=500`);
                        if (res.ok) {
                            const { data } = await res.json();
                            const consultor = data?.find((c: any) => c.id === contract.consultor_id);
                            if (consultor) setConsultorData(consultor);
                        }
                    } catch (e) { console.error('Error fetching consultor', e); }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingRedeem = async () => {
        try {
            const { data, error } = await supabase
                .from('resgates')
                .select('*')
                .eq('contrato_id', contract.id)
                .order('created_at', { ascending: false })
                .maybeSingle();

            if (!error && data) {
                setExistingRedeem(data);
            }
        } catch (err) {
            console.error('Error checking existing redeem:', err);
        }
    };

    const calculateInstallments = () => {
        try {
            const calculatedInstallments: any[] = [];
            const rawStartDate = contract.startDate || contract.data_inicio;
            if (!rawStartDate) return;

            let startDate: Date;
            if (typeof rawStartDate === 'string' && rawStartDate.includes('/')) {
                startDate = new Date(rawStartDate.split('/').reverse().join('-'));
            } else {
                startDate = new Date(rawStartDate);
            }

            const rawAmount = contract.amount || contract.valor_aporte;
            let amount: number;
            if (typeof rawAmount === 'string') {
                amount = parseFloat(rawAmount.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
            } else {
                amount = Number(rawAmount) || 0;
            }

            const rawYield = contract.yield || contract.taxa_mensal;
            let rate: number;
            if (typeof rawYield === 'string') {
                rate = parseFloat(rawYield.replace('%', '').replace(',', '.').trim()) / 100;
            } else {
                rate = (Number(rawYield) || 0) / 100;
            }

            const rawPeriod = contract.period || contract.periodo_meses;
            let months: number;
            if (typeof rawPeriod === 'string') {
                months = parseInt(rawPeriod.replace(' meses', ''));
            } else {
                months = Number(rawPeriod) || 12;
            }

            // Parcela 0 (Aporte)
            calculatedInstallments.push({
                parcela: 0,
                data: startDate.toLocaleDateString('pt-BR'),
                status: 'Pago',
                valor: amount,
                isAporte: true
            });

            // Monthly installments
            for (let i = 1; i <= months; i++) {
                const date = new Date(startDate);
                date.setMonth(startDate.getMonth() + i);
                calculatedInstallments.push({
                    parcela: i,
                    data: date.toLocaleDateString('pt-BR'),
                    status: 'Pendente',
                    valor: amount * rate,
                    isAporte: false
                });
            }

            // Final payment (return of principal)
            const finalDate = new Date(startDate);
            finalDate.setMonth(startDate.getMonth() + months);
            calculatedInstallments.push({
                parcela: months + 1,
                data: finalDate.toLocaleDateString('pt-BR'),
                status: 'Pendente',
                valor: amount,
                isPrincipalReturn: true
            });

            setInstallments(calculatedInstallments);
        } catch (err) {
            console.error('Error calculating installments:', err);
        }
    };

    const fetchComprovantes = async () => {
        if (!contract?.id) return;
        setLoadingComprovantes(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${contract.id}/comprovantes`);
            if (res.ok) {
                const data = await res.json();
                setComprovantes(data || []);
            }
        } catch (e) {
            console.error('Error fetching comprovantes:', e);
        } finally {
            setLoadingComprovantes(false);
        }
    };

    const handleDeleteComprovante = async (compId: string) => {
        setDeletingId(compId);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/comprovantes/${compId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setComprovantes(prev => prev.filter(c => c.id !== compId));
            }
        } catch (e) {
            console.error('Error deleting comprovante:', e);
        } finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    if (!contract) return null;

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true);
        try {
            const contractId = contract.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}/pdf`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Erro ao gerar PDF' }));
                alert(err.error || 'Erro ao gerar PDF');
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contrato_${contract.codigo || contractId.substring(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading PDF:', err);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleViewPdf = async () => {
        setViewingPdf(true);
        try {
            const contractId = contract.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}/pdf`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Erro ao gerar PDF' }));
                alert(err.error || 'Erro ao gerar PDF');
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Error viewing PDF:', err);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setViewingPdf(false);
        }
    };

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    const formatDate = (d: string) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('pt-BR');
    };

    // Normalize contract data (handles both formatted client data and raw DB data)
    const getProduct = () => contract.product || contract.titulo || '-';
    const getAmount = () => {
        if (contract.amount) return contract.amount;
        if (contract.valor_aporte) return formatCurrency(contract.valor_aporte);
        return '-';
    };
    const getYield = () => {
        if (contract.yield) return contract.yield;
        if (contract.taxa_mensal) return `${contract.taxa_mensal}%`;
        return '-';
    };
    const getStartDate = () => {
        if (contract.startDate) return contract.startDate;
        if (contract.data_inicio) return formatDate(contract.data_inicio);
        return '-';
    };
    const getEndDate = () => {
        if (contract.endDate) return contract.endDate;
        if (contract.data_inicio && contract.periodo_meses) {
            const start = new Date(contract.data_inicio);
            start.setMonth(start.getMonth() + (contract.periodo_meses || 0));
            return formatDate(start.toISOString());
        }
        return '-';
    };
    const getPeriod = () => {
        if (contract.period) return contract.period;
        if (contract.periodo_meses) return `${contract.periodo_meses} meses`;
        return '-';
    };
    const getPaymentType = () => {
        if (contract.rendimento) return contract.rendimento;
        if (contract.dia_pagamento) return 'Mensal';
        return 'Mensal';
    };
    const getDisplayId = () => contract.displayId || contract.codigo || contract.id?.substring(0, 8)?.toUpperCase() || '-';
    const getStatus = () => contract.status || 'Rascunho';

    const getProcessList = () => [
        {
            title: 'Comprovante anexado',
            description: 'Verificar se o consultor anexou o contrato de prestação de serviços.',
            status: comprovantes.length > 0 || contract.arquivo_url ? 'approved' : 'pending',
        },
        {
            title: 'Perfil do investidor',
            description: 'Confirmar que o consultor completou todo o processo de verificação KYC.',
            status: (clientData || userProfile)?.onboarding_finalizado ? 'approved' : 'pending',
        },
        {
            title: 'Assinatura do contrato',
            description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários.',
            status: contract.data_assinatura ? 'approved' : 'pending',
        }
    ];


    const contractStatus = getStatus();

    const checkRenewalVisibility = () => {
        // Se já tem solicitação, mostra sempre (para quem tem permissão de ver, ou seja, todos com acesso ao modal)
        if (existingRenewal) return true;

        // Se não é cliente, só vê se tiver solicitação (já tratado acima)
        if (!isClient) return false;

        // Regra do cliente: faltando 2 meses para o fim
        const endDateStr = contract.data_vencimento || contract.endDate;
        let endDate = endDateStr ? new Date(endDateStr) : null;

        if (!endDate && contract.data_inicio && contract.periodo_meses) {
            const start = new Date(contract.data_inicio);
            // Tentar converter periodo_meses para numero
            const period = Number(String(contract.periodo_meses).replace(/\D/g, '')) || 0;
            if (period > 0) {
                start.setMonth(start.getMonth() + period);
                endDate = start;
            }
        }

        if (!endDate) return false;

        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 2 meses = ~60 dias. Se faltar MENOS de 65 dias (ou ja venceu), pode renovar.
        return diffDays <= 65;
    };

    const checkRedeemVisibility = () => {
        if (existingRedeem) return true;
        if (!isClient) return false;

        // Regra do cliente: Status Vigente
        const activeStatuses = ['Ativo', 'Vigente', 'Assinado'];
        return activeStatuses.includes(contractStatus);
    };

    const showRenewalCard = checkRenewalVisibility();
    const showRedeemCard = checkRedeemVisibility();

    const getFileIcon = (filename: string) => {
        const ext = filename?.toLowerCase().split('.').pop();
        if (ext === 'pdf') return <File size={18} className="text-red-400" />;
        if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <FileImage size={18} className="text-blue-400" />;
        return <Paperclip size={18} className="text-slate-400" />;
    };

    const processCount = getProcessList();
    const approvedCount = processCount.filter(p => p.status === 'approved').length;
    const progressPercent = Math.round((approvedCount / processCount.length) * 100);

    return (
        <>
            <AnimatePresence>
                {/* Backdrop */}
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-[#002B49]/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="fixed inset-0 z-[201] flex items-start justify-center pt-2 pb-4 px-4 overflow-y-auto pointer-events-none">
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                        className={`bg-white rounded-2xl w-full shadow-2xl relative mt-2 mb-8 pointer-events-auto ${isClient ? 'max-w-5xl' : 'max-w-2xl'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3.5">
                                <div className={`${isClient ? 'w-14 h-14 bg-[#E6F6F7] text-[#00A3B1]' : 'w-11 h-11 bg-gradient-to-br from-[#00A3B1] to-[#008c99] shadow-lg shadow-[#00A3B1]/20'} rounded-xl flex items-center justify-center`}>
                                    {isClient ? (
                                        <Wallet size={28} strokeWidth={1.5} className="text-[#00A3B1]" />
                                    ) : (
                                        <FileText className="text-white" size={20} />
                                    )}
                                </div>
                                <div>
                                    <h2 className={`${isClient ? 'text-2xl' : 'text-lg'} font-bold text-[#002B49] leading-tight`}>Informações do contrato</h2>
                                    {(contract.codigo || getDisplayId()) && (
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                            Código: <span className="text-[#00A3B1] font-semibold">{getDisplayId()}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {canManageComprovantes && (
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={downloadingPdf}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#00A3B1] to-[#008c99] hover:from-[#008c99] hover:to-[#007a87] rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#00A3B1]/15"
                                    >
                                        {downloadingPdf ? (
                                            <><Loader2 size={13} className="animate-spin" /> Gerando...</>
                                        ) : (
                                            <><Download size={13} /> Gerar PDF</>
                                        )}
                                    </button>
                                )}
                                {isClient && (
                                    <button
                                        onClick={handleViewPdf}
                                        disabled={viewingPdf}
                                        className="flex items-center gap-2 text-[#00A3B1] text-sm font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                                    >
                                        {viewingPdf ? (
                                            <><Loader2 size={18} className="animate-spin" /> Carregando...</>
                                        ) : contract.clicksign_envelope_id && contract.data_assinatura ? (
                                            <><CheckCircle2 size={18} className="text-green-500" /> Ver Assinado</>
                                        ) : (
                                            <><Eye size={20} /> Visualizar</>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className={`px-6 pb-6 space-y-5 ${isClient ? 'max-h-[80vh]' : 'max-h-[72vh]'} overflow-y-auto`} style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                            {/* Quick Info Cards */}
                            <div className={`grid gap-3 ${isClient ? 'grid-cols-2 md:grid-cols-4 mt-6' : 'grid-cols-4'}`}>
                                <QuickCard label="Status">
                                    <ContractStatusBadge status={contractStatus} />
                                </QuickCard>
                                <QuickCard label="Contrato é unificado?">
                                    <span className="text-sm font-bold text-[#002B49]">Não</span>
                                </QuickCard>
                                <QuickCard label="Cód. externo">
                                    <span className="text-sm font-bold text-[#002B49]">
                                        {contract.codigo_externo || contract.id?.substring(0, 8) || '-'}
                                    </span>
                                </QuickCard>
                                <QuickCard label="Cód. contrato">
                                    <span className="text-sm font-bold text-[#002B49]">
                                        {getDisplayId()}
                                    </span>
                                </QuickCard>
                            </div>

                            {/* Contract Details */}
                            <SectionCard title="Contrato" icon={<FileText size={15} />}>
                                <div className={`grid gap-4 ${isClient ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12' : 'grid-cols-3'}`}>
                                    <InfoField label="Produto">{getProduct()}</InfoField>
                                    <InfoField label="Tipo do rendimento">{getPaymentType()}</InfoField>
                                    <InfoField label="Valor aportado">
                                        <span className="text-[#00A3B1] font-bold">{getAmount()}</span>
                                    </InfoField>
                                </div>
                                <div className={`grid gap-4 mt-4 ${isClient ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12' : 'grid-cols-3'}`}>
                                    <InfoField label="Taxa de remuneração">
                                        <span className="text-emerald-600 font-bold">{getYield()}</span>
                                    </InfoField>
                                    <InfoField label="Início da vigência">{getStartDate()}</InfoField>
                                    <InfoField label="Fim da vigência">{getEndDate()}</InfoField>
                                </div>
                            </SectionCard>

                            {/* Action Buttons */}
                            {(showRenewalCard || showRedeemCard) && (
                                <div className="space-y-3">
                                    {showRenewalCard && (
                                        <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-[#009CA3]/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#E6F6F7] text-[#009CA3] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <RefreshCw size={20} />
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <h4 className="text-sm font-bold text-[#002B49]">Renovação contratual</h4>
                                                    <p className="text-xs text-slate-500">
                                                        {existingRenewal
                                                            ? `Solicitação enviada em ${new Date(existingRenewal.data_solicitacao).toLocaleDateString('pt-BR')} • Status: ${existingRenewal.status}`
                                                            : 'Deseja realizar a renovação deste contrato?'}
                                                    </p>
                                                </div>
                                            </div>
                                            {existingRenewal ? (
                                                <button
                                                    onClick={() => setShowRenewalView(true)}
                                                    className="w-full sm:w-auto bg-white border border-[#009CA3] text-[#009CA3] hover:bg-[#E6F6F7] text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={14} /> Visualizar Solicitação
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShowRenewalModal(true)}
                                                    disabled={loadingRenewal}
                                                    className="w-full sm:w-auto bg-[#009CA3] hover:bg-[#008C93] text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#009CA3]/20"
                                                >
                                                    Enviar solicitação <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {showRedeemCard && (
                                        <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-[#009CA3]/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Wallet size={20} />
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <h4 className="text-sm font-bold text-[#002B49]">Resgate de valores</h4>
                                                    <p className="text-xs text-slate-500">
                                                        {existingRedeem
                                                            ? `Solicitação enviada em ${new Date(existingRedeem.data_solicitacao).toLocaleDateString('pt-BR')} • Status: ${existingRedeem.status}`
                                                            : 'Deseja solicitar o resgate antecipado?'}
                                                    </p>
                                                </div>
                                            </div>
                                            {existingRedeem ? (
                                                <button
                                                    onClick={() => setShowRedeemView(true)}
                                                    className="w-full sm:w-auto bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={14} /> Visualizar Solicitação
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShowRedeemModal(true)}
                                                    className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Solicitar resgate <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Client & Consultant */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SectionCard title="Cliente" icon={<User size={15} />}>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Loader2 size={14} className="animate-spin" /> Carregando...
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <InfoField label="Nome">
                                                {clientData?.nome_fantasia || clientData?.razao_social || userProfile?.nome_fantasia || userProfile?.razao_social || contract.client_name || 'Investidor'}
                                            </InfoField>
                                            <InfoField label="Email">
                                                <span className="text-xs">{clientData?.email || userProfile?.email || '-'}</span>
                                            </InfoField>

                                        </div>
                                    )}
                                </SectionCard>

                                <SectionCard title="Consultor" icon={<User size={15} />}>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Loader2 size={14} className="animate-spin" /> Carregando...
                                        </div>
                                    ) : consultorData ? (
                                        <div className="space-y-3">
                                            <InfoField label="Nome">
                                                {consultorData?.nome_fantasia || consultorData?.razao_social || '-'}
                                            </InfoField>
                                            <InfoField label="Email">
                                                <span className="text-xs">{consultorData?.email || '-'}</span>
                                            </InfoField>
                                            {isClient && (
                                                <InfoField label="Consultor atual">
                                                    {consultorData?.nome_fantasia || 'Sim'}
                                                </InfoField>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Consultor não atribuído</p>
                                    )}
                                </SectionCard>
                            </div>

                            {/* Unit */}
                            <SectionCard title="Unidade" icon={<Building2 size={15} />}>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoField label="CNPJ">56.441.752/0001-00</InfoField>
                                    <InfoField label="Descrição da unidade">FNCD Capital Ltda</InfoField>
                                </div>
                            </SectionCard>

                            {/* Process List */}
                            <SectionCard
                                title="Lista de processos"
                                icon={<ClipboardList size={15} />}
                                headerRight={
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 }}
                                                className="h-full bg-gradient-to-r from-[#00A3B1] to-emerald-400 rounded-full"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{approvedCount}/{processCount.length}</span>
                                    </div>
                                }
                            >
                                <p className="text-xs text-slate-400 mb-4">Acompanhe abaixo o status da aprovação do contrato.</p>
                                <div className="space-y-0">
                                    {processCount.map((process, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center justify-between py-3 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${process.status === 'approved'
                                                        ? 'bg-emerald-50 border border-emerald-200 shadow-sm shadow-emerald-100'
                                                        : 'bg-amber-50 border border-amber-200 shadow-sm shadow-amber-100'
                                                        }`}>
                                                        {process.status === 'approved' ? (
                                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                                        ) : (
                                                            <Clock size={16} className="text-amber-500" />
                                                        )}
                                                    </div>
                                                    {idx < processCount.length - 1 && (
                                                        <div className="absolute left-1/2 top-full w-px h-3 -translate-x-1/2 bg-slate-200" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#002B49]">{process.title}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{process.description}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${process.status === 'approved'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                                                }`}>
                                                {process.status === 'approved' ? (
                                                    <><CheckCircle2 size={11} /> Aprovado</>
                                                ) : (
                                                    <><Clock size={11} /> Pendente</>
                                                )}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </SectionCard>

                            {/* Comprovantes - Admin/Consultant only: with upload & manage */}
                            {canManageComprovantes && (
                                <SectionCard
                                    title="Comprovantes"
                                    icon={<Paperclip size={15} />}
                                    headerRight={
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#00A3B1] to-[#008c99] rounded-xl hover:from-[#008c99] hover:to-[#007a87] transition-all active:scale-95 shadow-md shadow-[#00A3B1]/15"
                                        >
                                            <Upload size={12} /> Upload
                                        </button>
                                    }
                                >
                                    {loadingComprovantes ? (
                                        <div className="flex items-center justify-center py-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={22} className="animate-spin text-[#00A3B1]" />
                                                <span className="text-xs text-slate-400">Carregando comprovantes...</span>
                                            </div>
                                        </div>
                                    ) : comprovantes.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-b from-slate-50/50 to-white rounded-xl border border-dashed border-slate-200">
                                            <div className="w-14 h-14 bg-[#E6F6F7] rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                                                <Paperclip className="text-[#00A3B1]" size={22} />
                                            </div>
                                            <p className="text-sm font-bold text-[#002B49]">Nenhum comprovante anexado</p>
                                            <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center leading-relaxed">
                                                Anexe o comprovante de confirmação do aporte deste contrato para dar andamento.
                                            </p>
                                            <button
                                                onClick={() => setShowUploadModal(true)}
                                                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#00A3B1] bg-[#E6F6F7] hover:bg-[#d5eff1] rounded-xl transition-all active:scale-95"
                                            >
                                                <Upload size={13} /> Anexar comprovante
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {comprovantes.map((comp, idx) => (
                                                <motion.div
                                                    key={comp.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 hover:border-[#00A3B1]/30 hover:shadow-md hover:shadow-[#00A3B1]/5 transition-all duration-200 group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E6F6F7] group-hover:border-[#00A3B1]/20 transition-all">
                                                            {getFileIcon(comp.arquivo_nome)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-[#002B49] truncate">
                                                                {comp.arquivo_nome || 'comprovante.pdf'}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                {comp.data_transferencia && (
                                                                    <span className="flex items-center gap-1 text-[11px] text-[#00A3B1] font-medium">
                                                                        <Calendar size={10} />
                                                                        {formatDate(comp.data_transferencia)}
                                                                    </span>
                                                                )}
                                                                <span className="text-[11px] text-slate-300">
                                                                    Enviado em {formatDate(comp.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={comp.arquivo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-slate-400 hover:text-[#00A3B1] rounded-lg hover:bg-[#E6F6F7] transition-all"
                                                            title="Visualizar"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                        <button
                                                            onClick={() => setConfirmDelete(comp.id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </SectionCard>
                            )}

                            {/* Comprovantes Read-only - Client */}
                            {isClient && (
                                <SectionCard title="Anexar comprovantes" icon={<Paperclip size={15} />}>
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center text-[#00A3B1] group-hover:scale-110 transition-transform">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#002B49]">Nenhum comprovante anexado.</p>
                                            <p className="text-xs text-slate-400 mt-1">Anexar comprovante de confirmação do aporte deste contato</p>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}

                            {/* Contracts attachment - Client */}
                            {isClient && (
                                <SectionCard title="Anexar contratos" icon={<FileText size={15} />}>
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center text-[#00A3B1] group-hover:scale-110 transition-transform">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#002B49]">Nenhum contrato anexado.</p>
                                            <p className="text-xs text-slate-400 mt-1">Anexe um contrato assinado pelas partes envolvidas</p>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}

                            {/* Dividends */}
                            <SectionCard title="Dividendos do cliente" icon={<DollarSign size={15} />}>
                                {isClient && installments.length > 0 ? (
                                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                                        <table className="w-full text-left min-w-[600px]">
                                            <thead className="bg-[#F8FAFB] border-b border-slate-100">
                                                <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                                                    <th className="px-6 py-4">Parcela</th>
                                                    <th className="px-6 py-4">Data de vencimento</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Valor dividendo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {installments.map((inst, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 text-sm">
                                                        <td className="px-6 py-4 font-medium text-slate-600">
                                                            {inst.isAporte ? 'Aporte' : inst.isPrincipalReturn ? 'Resgate Principal' : inst.parcela}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500">{inst.data}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-sm font-bold px-4 py-1 rounded-full ${inst.status === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {inst.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-[#002B49]">
                                                            {formatCurrency(inst.valor)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<DollarSign className="text-emerald-500" size={20} />}
                                        iconBg="bg-emerald-50"
                                        title="Nenhum registro encontrado"
                                        subtitle="Os dividendos serão exibidos quando houver pagamentos registrados."
                                    />
                                )}
                            </SectionCard>

                            {/* Commissions - Only for admin/consultant */}
                            {canManageComprovantes && (
                                <SectionCard title="Comissões do consultor" icon={<TrendingUp size={15} />}>
                                    <EmptyState
                                        icon={<TrendingUp className="text-[#00A3B1]" size={20} />}
                                        iconBg="bg-[#E6F6F7]"
                                        title="Nenhum registro encontrado"
                                        subtitle="As comissões serão registradas conforme os processos forem concluídos."
                                    />
                                </SectionCard>
                            )}
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* Upload Modal */}
            {showUploadModal && contract && (
                <UploadComprovanteModal
                    contractId={contract.id}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchComprovantes();
                    }}
                />
            )}

            {/* Renewal Confirm Modal */}
            <RenewalConfirmModal
                open={showRenewalModal}
                contract={contract}
                onClose={() => setShowRenewalModal(false)}
                onSuccess={async () => {
                    setShowRenewalModal(false);
                    await fetchExistingRenewal();
                    setShowRenewalView(true);
                }}
            />

            {/* Renewal View Modal */}
            <RenewalViewModal
                open={showRenewalView}
                renewal={existingRenewal}
                contractCode={contract.codigo || contract.displayId || contract.id?.substring(0, 8).toUpperCase()}
                onClose={() => setShowRenewalView(false)}
            />

            {/* Redeem Request Modal */}
            <RedeemRequestModal
                open={showRedeemModal}
                contract={contract}
                onClose={() => setShowRedeemModal(false)}
                onSuccess={async () => {
                    setShowRedeemModal(false);
                    await fetchExistingRedeem();
                    setShowRedeemView(true);
                }}
            />

            {/* Redeem View Modal */}
            <RedeemViewModal
                open={showRedeemView}
                redeem={existingRedeem}
                contractCode={contract.codigo || contract.displayId || contract.id?.substring(0, 8).toUpperCase()}
                contractValue={contract.valor_aporte || contract.valor || 0}
                onClose={() => setShowRedeemView(false)}
            />
            {/* Confirm Delete Dialog */}
            <AnimatePresence>
                {confirmDelete && (
                    <ConfirmDialog
                        open={!!confirmDelete}
                        title="Excluir comprovante"
                        message="Tem certeza que deseja excluir este comprovante? Esta ação não pode ser desfeita."
                        confirmLabel={deletingId ? 'Excluindo...' : 'Excluir'}
                        loading={!!deletingId}
                        onConfirm={() => handleDeleteComprovante(confirmDelete)}
                        onCancel={() => setConfirmDelete(null)}
                    />
                )}
            </AnimatePresence>

            {/* KYC Document Modal */}
            {showKYCModal && (
                <KYCDocumentModal
                    data={clientData || userProfile}
                    onClose={() => setShowKYCModal(false)}
                />
            )}
        </>
    );
};

/* ── Sub Components ── */

const QuickCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
        <div>{children}</div>
    </div>
);

const InfoField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-semibold text-[#002B49]">{children}</div>
    </div>
);

const SectionCard = ({
    title,
    icon,
    headerRight,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 border-b border-slate-100">
            <div className="flex items-center gap-2">
                {icon && <span className="text-[#00A3B1]">{icon}</span>}
                <h4 className="text-sm font-bold text-[#002B49]">{title}</h4>
            </div>
            {headerRight}
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const EmptyState = ({
    icon,
    iconBg,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    iconBg: string; // e.g., 'bg-emerald-50'
    title: string;
    subtitle: string;
}) => (
    <div className="flex flex-col items-center justify-center py-8">
        <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-3 shadow-sm`}>
            {icon}
        </div>
        <p className="text-sm font-bold text-[#002B49]">{title}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-[300px] text-center leading-relaxed">{subtitle}</p>
    </div>
);

export default ConsultantContractDetailModal;
