import React, { useState, useEffect } from 'react';
import { X, Eye, Upload, CheckCircle2, Clock, AlertCircle, FileText, DollarSign, User, Building2, ClipboardList, Paperclip, TrendingUp, Download, Loader2, Trash2, ExternalLink, Calendar, ShieldCheck, AlertTriangle, FileImage, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadComprovanteModal from './UploadComprovanteModal';

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
const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ contract, onClose }) => {
    const [clientData, setClientData] = useState<any>(null);
    const [consultorData, setConsultorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
    const [loadingComprovantes, setLoadingComprovantes] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        if (contract) {
            fetchRelatedData();
            fetchComprovantes();
        }
    }, [contract]);

    const fetchRelatedData = async () => {
        setLoading(true);
        try {
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
        } finally {
            setLoading(false);
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

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    const formatDate = (d: string) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('pt-BR');
    };

    const getPaymentType = () => {
        if (contract.dia_pagamento) return 'Mensal';
        return '-';
    };

    const getEndDate = () => {
        if (contract.data_inicio && contract.periodo_meses) {
            const start = new Date(contract.data_inicio);
            start.setMonth(start.getMonth() + (contract.periodo_meses || 0));
            return formatDate(start.toISOString());
        }
        return '-';
    };

    const getProcessList = () => [
        {
            title: 'Comprovante anexado',
            description: 'Verificar se o consultor anexou o contrato de prestação de serviços.',
            status: comprovantes.length > 0 || contract.arquivo_url ? 'approved' : 'pending',
        },
        {
            title: 'Perfil do investidor',
            description: 'Confirmar que o consultor completou todo o processo de verificação KYC.',
            status: clientData?.onboarding_finalizado ? 'approved' : 'pending',
        },
        {
            title: 'Assinatura do contrato',
            description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários.',
            status: contract.data_assinatura ? 'approved' : 'pending',
        }
    ];

    const contractStatus = contract.status || 'Rascunho';
    const contractStatusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        'Vigente': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
        'Em processo': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
        'Processando': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
        'Finalizado': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
        'Cancelado': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
    };
    const statusCfg = contractStatusConfig[contractStatus] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };

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
                <div className="fixed inset-0 z-[201] flex items-start justify-center p-4 overflow-y-auto pointer-events-none">
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative my-8 pointer-events-auto"
                    >
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-[#00A3B1] via-[#00c4d4] to-[#00A3B1] rounded-t-2xl" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 bg-gradient-to-br from-[#00A3B1] to-[#008c99] rounded-xl flex items-center justify-center shadow-lg shadow-[#00A3B1]/20">
                                    <FileText className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#002B49] leading-tight">Informações do contrato</h2>
                                    {contract.codigo && (
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                            Código: <span className="text-[#00A3B1] font-semibold">{contract.codigo}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                {contract.arquivo_url && (
                                    <a
                                        href={contract.arquivo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#00A3B1] bg-[#E6F6F7] hover:bg-[#d5eff1] rounded-xl transition-all"
                                    >
                                        <Eye size={13} /> Ver
                                    </a>
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
                        <div className="px-6 pb-6 space-y-5 max-h-[72vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                            {/* Quick Info Cards */}
                            <div className="grid grid-cols-4 gap-3">
                                <QuickCard label="Status">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                        {contractStatus}
                                    </span>
                                </QuickCard>
                                <QuickCard label="Verificado">
                                    <div className="flex items-center gap-1.5">
                                        {contract.data_assinatura ? (
                                            <><ShieldCheck size={14} className="text-emerald-500" /><span className="text-sm font-semibold text-emerald-600">Sim</span></>
                                        ) : (
                                            <><AlertCircle size={14} className="text-amber-400" /><span className="text-sm font-semibold text-amber-600">Não</span></>
                                        )}
                                    </div>
                                </QuickCard>
                                <QuickCard label="Cód. externo">
                                    <span className="text-sm font-bold text-[#002B49]">
                                        {contract.codigo_externo || contract.id?.substring(0, 8) || '-'}
                                    </span>
                                </QuickCard>
                                <QuickCard label="Cód. contrato">
                                    <span className="text-sm font-bold text-[#002B49]">
                                        {contract.codigo || '-'}
                                    </span>
                                </QuickCard>
                            </div>

                            {/* Contract Details */}
                            <SectionCard title="Detalhes do Contrato" icon={<FileText size={15} />}>
                                <div className="grid grid-cols-3 gap-4">
                                    <InfoField label="Produto">{contract.titulo || '-'}</InfoField>
                                    <InfoField label="Tipo do rendimento">{getPaymentType()}</InfoField>
                                    <InfoField label="Valor aportado">
                                        <span className="text-[#00A3B1] font-bold">{formatCurrency(contract.valor_aporte)}</span>
                                    </InfoField>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <InfoField label="Taxa de remuneração">
                                        {contract.taxa_mensal ? <span className="text-emerald-600 font-bold">{contract.taxa_mensal}%</span> : '-'}
                                    </InfoField>
                                    <InfoField label="Início da vigência">{formatDate(contract.data_inicio)}</InfoField>
                                    <InfoField label="Fim da vigência">{getEndDate()}</InfoField>
                                </div>
                            </SectionCard>

                            {/* Client & Consultant */}
                            <div className="grid grid-cols-2 gap-4">
                                <SectionCard title="Cliente" icon={<User size={15} />}>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Loader2 size={14} className="animate-spin" /> Carregando...
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <InfoField label="Nome">
                                                {clientData?.nome_fantasia || clientData?.razao_social || contract.client_name || '-'}
                                            </InfoField>
                                            <InfoField label="Email">
                                                <span className="text-xs">{clientData?.email || '-'}</span>
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
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Consultor não atribuído</p>
                                    )}
                                </SectionCard>
                            </div>

                            {/* Unit */}
                            <SectionCard title="Unidade" icon={<Building2 size={15} />}>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoField label="CNPJ">56.441.252/0001-00</InfoField>
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
                                    {getProcessList().map((process, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center justify-between py-3 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Icon with connection line */}
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

                            {/* Comprovantes */}
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

                            {/* Dividends */}
                            <SectionCard title="Dividendos do cliente" icon={<DollarSign size={15} />}>
                                <EmptyState
                                    icon={<DollarSign className="text-emerald-500" size={20} />}
                                    iconBg="bg-emerald-50"
                                    title="Nenhum registro encontrado"
                                    subtitle="Os dividendos serão exibidos quando houver pagamentos registrados."
                                />
                            </SectionCard>

                            {/* Commissions */}
                            <SectionCard title="Comissões do consultor" icon={<TrendingUp size={15} />}>
                                <EmptyState
                                    icon={<TrendingUp className="text-[#00A3B1]" size={20} />}
                                    iconBg="bg-[#E6F6F7]"
                                    title="Nenhum registro encontrado"
                                    subtitle="As comissões serão registradas conforme os processos forem concluídos."
                                />
                            </SectionCard>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadComprovanteModal
                    contractId={contract.id}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={fetchComprovantes}
                />
            )}

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
    iconBg: string;
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

export default ContractDetailModal;
