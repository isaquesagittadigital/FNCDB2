
import React, { useEffect, useState } from 'react';
import { X, Eye, CheckCircle2, FileText, Download, ArrowRight, RefreshCw, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';

interface ContractDetailsModalProps {
    contract: any;
    onClose: () => void;
    userProfile: any;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, onClose, userProfile }) => {
    const [loading, setLoading] = useState(true);
    const [consultantData, setConsultantData] = useState<any>(null);
    const [installments, setInstallments] = useState<any[]>([]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // data.contract contains basic contract info.
                // Fetch consultant if available
                if (contract.consultor_id) {
                    const { data: consultant } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', contract.consultor_id)
                        .single();
                    setConsultantData(consultant);
                } else if (userProfile.consultant_id) {
                    const { data: consultant } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', userProfile.consultant_id)
                        .single();
                    setConsultantData(consultant);
                }

                // Calculate projected installments since none exist in DB yet for these test contracts
                const calculatedInstallments = [];
                const startDate = new Date(contract.startDate.split('/').reverse().join('-')); // DD/MM/YYYY -> YYYY-MM-DD
                const amount = parseFloat(contract.amount.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
                const rate = parseFloat(contract.yield.replace('%', '').replace(',', '.').trim()) / 100;
                const months = parseInt(contract.period.replace(' meses', ''));

                // Parcela 0 (Aporte)
                calculatedInstallments.push({
                    parcela: 0,
                    data: startDate.toLocaleDateString('pt-BR'),
                    status: 'Pago',
                    valor: amount,
                    isAporte: true
                });

                // Other installments
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
                    parcela: months + 1, // Or just mark it specially
                    data: finalDate.toLocaleDateString('pt-BR'),
                    status: 'Pendente',
                    valor: amount,
                    isPrincipalReturn: true
                });

                setInstallments(calculatedInstallments);

            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [contract, userProfile]);

    const InfoRow = ({ label, value, isBold = false }: { label: string, value: string | React.ReactNode, isBold?: boolean }) => (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <span className={`text-base text-[#002B49] ${isBold ? 'font-bold' : 'font-medium'}`}>{value}</span>
        </div>
    );

    const SectionTitle = ({ title }: { title: string }) => (
        <h3 className="text-lg font-bold text-[#002B49] mb-4">{title}</h3>
    );

    const StatusBadge = ({ status }: { status: string }) => (
        <span className={`text-sm font-bold px-6 py-1.5 rounded-full whitespace-nowrap inline-block ${status === 'Vigente' || status === 'Ativo' ? 'bg-[#F2F1FF] text-[#7C3AED]' :
            status === 'Pago' ? 'bg-emerald-50 text-emerald-600' :
                status === 'Pendente' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
            }`}>
            {status}
        </span>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-white w-full max-w-5xl rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex flex-col p-6 sm:p-8 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0 gap-6">
                        <div className="flex items-start justify-between">
                            <div className='flex flex-col gap-4 w-full'>
                                <div className="w-14 h-14 bg-[#E6F6F7] rounded-full flex items-center justify-center text-[#00A3B1]">
                                    <Wallet size={28} strokeWidth={1.5} />
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <h2 className="text-2xl font-bold text-[#002B49]">Informações do contrato</h2>
                                    <button className="flex items-center gap-2 text-[#00A3B1] text-sm font-bold hover:opacity-80 transition-opacity">
                                        <Eye size={20} />
                                        Visualizar
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">

                        {/* Top Info Grid */}
                        <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-slate-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-slate-500">Status</span>
                                    <div className="flex"><StatusBadge status={contract.status} /></div>
                                </div>
                                <InfoRow label="Contrato é unificado?" value="Não" isBold />
                                <InfoRow label="Cód. externo" value={contract.codigo_externo || '03819944'} />
                                <InfoRow label="Cód. contrato" value={contract.displayId} />
                            </div>
                        </div>

                        {/* Contrato Details */}
                        <div>
                            <SectionTitle title="Contrato" />
                            <div className="bg-[#FAFAFA] rounded-2xl p-8 border border-slate-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
                                    <InfoRow label="Produto:" value={`0001 - ${contract.product}`} />
                                    <InfoRow label="Tipo do rendimento:" value={contract.rendimento || 'Mensal'} />
                                    <InfoRow label="Valor aportado:" value={contract.amount} />
                                    <InfoRow label="Taxa de remuneração:" value={contract.yield} />
                                    <InfoRow label="Início da vigência:" value={contract.startDate} />
                                    <InfoRow label="Fim da vigência:" value={contract.endDate} />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* Renovação */}
                            <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-[#009CA3]/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#E6F6F7] text-[#009CA3] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <RefreshCw size={20} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="text-sm font-bold text-[#002B49]">Renovação contratual</h4>
                                        <p className="text-xs text-slate-500">Deseja realizar a renovação deste contrato?</p>
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto bg-[#009CA3] hover:bg-[#008C93] text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#009CA3]/20">
                                    Enviar solicitação <ArrowRight size={14} />
                                </button>
                            </div>

                            {/* Resgate */}
                            <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-[#009CA3]/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Wallet size={20} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="text-sm font-bold text-[#002B49]">Resgate de valores</h4>
                                        <p className="text-xs text-slate-500">Deseja solicitar o resgate antecipado?</p>
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Solicitar resgate <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Cliente & Consultor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <div>
                                <SectionTitle title="Cliente" />
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoRow label="Nome" value={userProfile?.nome_fantasia || userProfile?.razao_social || 'Investidor'} />
                                        <InfoRow label="Email" value={userProfile?.email || '-'} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <SectionTitle title="Consultor" />
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoRow label="Nome" value={consultantData?.nome_fantasia || consultantData?.razao_social || 'Consultor FNCD'} />
                                        <InfoRow label="Email" value={consultantData?.email || '-'} />
                                        <InfoRow label="Consultor atual" value={consultantData?.nome_fantasia || 'Sim'} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Unidade */}
                        <div>
                            <SectionTitle title="Unidade" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                                <InfoRow label="CNPJ" value="56.441.752/0001-00" />
                                <InfoRow label="Descrição da unidade" value="FNCD Capital Ltda" />
                            </div>
                        </div>

                        {/* Processos */}
                        <div>
                            <SectionTitle title="Lista de processos" />
                            <div className="space-y-3">
                                <p className="text-xs text-slate-400 mb-4">Acompanhe abaixo o status da aprovação do contrato.</p>
                                {[
                                    { title: "Comprovante anexado", desc: "Verificar se o consultor assinou o contrato de prestação de serviços", status: "Aprovado" },
                                    { title: "Perfil do investidor", desc: "Confirmar que o consultor completou todo o processo de verificação KYC", status: "Aprovado" },
                                    { title: "Assinatura do contrato", desc: "Verificar se o consultor anexou todos os documentos comprobatórios necessários", status: "Aprovado" }
                                ].map((process, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl gap-3">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 text-emerald-500 bg-emerald-50 p-1 rounded-full shrink-0"><CheckCircle2 size={16} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-[#002B49]">{process.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">{process.desc}</p>
                                            </div>
                                        </div>
                                        <span className="self-end sm:self-auto bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                            {process.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Anexos Placeholders */}
                        <div className="space-y-6">
                            <div>
                                <SectionTitle title="Anexar comprovantes" />
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center text-[#00A3B1] group-hover:scale-110 transition-transform">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#002B49]">Nenhum comprovante anexado.</p>
                                        <p className="text-xs text-slate-400 mt-1">Anexar comprovante de confirmação do aporte deste contato</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <SectionTitle title="Anexar contratos" />
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center text-[#00A3B1] group-hover:scale-110 transition-transform">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#002B49]">Nenhum contrato anexado.</p>
                                        <p className="text-xs text-slate-400 mt-1">Anexe um contrato assinado pelas partes envolvidas</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dividendos Table */}
                        <div>
                            <SectionTitle title="Dividendos do cliente" />
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
                                        {loading ? (
                                            <tr><td colSpan={4} className="p-4 text-center text-xs text-slate-400">Calculando...</td></tr>
                                        ) : installments.map((inst, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 text-sm">
                                                <td className="px-6 py-4 font-medium text-slate-600">
                                                    {inst.isAporte ? 'Aporte' : inst.isPrincipalReturn ? 'Resgate Principal' : inst.parcela}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{inst.data}</td>
                                                <td className="px-6 py-4"><StatusBadge status={inst.status} /></td>
                                                <td className="px-6 py-4 text-right font-bold text-[#002B49]">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inst.valor)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ContractDetailsModal;
