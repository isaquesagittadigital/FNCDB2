import React, { useState, useEffect, useMemo } from 'react';
import { Save, ArrowLeft, Calendar, FileText, User, DollarSign, BarChart, Mail, MessageCircle, MessageSquare, Check, X, ChevronRight, Package, AlertCircle, Home, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackModal, { FeedbackModalData } from '../../shared/ui/FeedbackModal';
import { calculateContractProjection } from '../../../lib/financialUtils';

interface ContractFormProps {
    contractId?: string | null;
    onBack: () => void;
    onSave?: () => void;
    userProfile?: any;
    onSubmitDetails?: (data: any) => Promise<void>;
}

const ContractForm: React.FC<ContractFormProps> = ({ contractId, onBack, onSave, userProfile, onSubmitDetails }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [signaturePreference, setSignaturePreference] = useState<'Email' | 'Whatsapp' | 'SMS'>('Email');
    const [clienteSearch, setClienteSearch] = useState('');
    const [showClienteDropdown, setShowClienteDropdown] = useState(false);
    const [consultants, setConsultants] = useState<any[]>([]); // To hold list of consultants for admin
    const [consultorSearch, setConsultorSearch] = useState('');
    const [showConsultorDropdown, setShowConsultorDropdown] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackModalData | null>(null);

    const [formData, setFormData] = useState({
        user_id: '',
        consultor_id: '', // Added consultor_id to state
        titulo: '0001 - Câmbio', // Default to Câmbio
        status: 'Rascunho',
        valor_aporte: 0,
        taxa_mensal: 0,
        periodo_meses: 6,
        data_inicio: new Date().toISOString().split('T')[0],
        dia_pagamento: 10,
        segundo_pagamento: 10
    });

    const [aporteDisplay, setAporteDisplay] = useState('');
    const [taxaDisplay, setTaxaDisplay] = useState('');

    useEffect(() => {
        if (formData.valor_aporte > 0) {
            setAporteDisplay(formData.valor_aporte.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
    }, []); // Only on mount/load

    const handleAporteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        const numericValue = Number(value) / 100;
        setFormData(prev => ({ ...prev, valor_aporte: numericValue }));
        setAporteDisplay(numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    };

    const handleTaxaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        let numericValue = Number(value) / 100;

        // Enforce 2% limit
        if (numericValue > 2) {
            numericValue = 2;
        }

        setFormData(prev => ({ ...prev, taxa_mensal: numericValue }));
        setTaxaDisplay(numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    };

    useEffect(() => {
        // Add style for calendar indicator
        const style = document.createElement('style');
        style.innerHTML = `
            input::-webkit-calendar-picker-indicator {
                background: transparent;
                bottom: 0;
                color: transparent;
                cursor: pointer;
                height: auto;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;
                width: auto;
            }
        `;
        document.head.appendChild(style);

        fetchClients();
        if (contractId) fetchContractData(contractId);

        return () => { document.head.removeChild(style); };
    }, [contractId]);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/clients`);
            if (res.ok) {
                const data = await res.json();
                setClients(data.data || []);
            }

            // If the user profile is admin or su, fetch consultants too
            if (userProfile && (userProfile.tipo_user === 'Admin' || userProfile.tipo_user === 'Suporte' || userProfile.is_su)) {
                const resC = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/consultants`);
                if (resC.ok) {
                    const dataC = await resC.json();
                    setConsultants(dataC.data || []);
                }
            }
        } catch (err) {
            console.error("Failed to fetch clients/consultants", err);
        }
    };

    const fetchContractData = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/contracts`);
            if (res.ok) {
                const data = await res.json();
                const contract = data.find((c: any) => c.id === id);
                if (contract) {
                    setFormData({
                        user_id: contract.user_id,
                        consultor_id: contract.consultor_id || '',
                        titulo: contract.titulo,
                        status: contract.status,
                        valor_aporte: contract.valor_aporte || 0,
                        taxa_mensal: contract.taxa_mensal || 0,
                        periodo_meses: contract.periodo_meses || 6,
                        data_inicio: contract.data_inicio ? contract.data_inicio.split('T')[0] : '',
                        dia_pagamento: contract.dia_pagamento || 10,
                        segundo_pagamento: contract.segundo_pagamento || 10
                    });

                    // If we have clients, find and select
                    const client = clients.find(c => c.id === contract.user_id);
                    if (client) setSelectedClient(client);
                }
            }
        } catch (error) {
            console.error("Failed to fetch contract", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formData.user_id && clients.length > 0) {
            const client = clients.find(c => c.id === formData.user_id);
            setSelectedClient(client || null);
            if (client) {
                setClienteSearch(client.nome_fantasia || client.razao_social || client.nome_completo || client.email || '');
            }
        }
    }, [formData.user_id, clients]);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setFormData(prev => ({ ...prev, user_id: id }));
    };

    const filteredClients = useMemo(() => {
        if (!clienteSearch) return [];
        return clients.filter(c =>
            (c.nome_fantasia || '').toLowerCase().includes(clienteSearch.toLowerCase()) ||
            (c.razao_social || '').toLowerCase().includes(clienteSearch.toLowerCase()) ||
            (c.nome_completo || '').toLowerCase().includes(clienteSearch.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(clienteSearch.toLowerCase()) ||
            (c.cpf || '').includes(clienteSearch) ||
            (c.cnpj || '').includes(clienteSearch)
        );
    }, [clients, clienteSearch]);

    const filteredConsultants = useMemo(() => {
        if (!consultorSearch) return consultants || [];
        return consultants.filter(c =>
            (c.nome_fantasia || '').toLowerCase().includes(consultorSearch.toLowerCase()) ||
            (c.razao_social || '').toLowerCase().includes(consultorSearch.toLowerCase()) ||
            (c.nome_completo || '').toLowerCase().includes(consultorSearch.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(consultorSearch.toLowerCase())
        );
    }, [consultants, consultorSearch]);

    useEffect(() => {
        if (formData.consultor_id && consultants.length > 0) {
            const cons = consultants.find(c => c.id === formData.consultor_id);
            if (cons) {
                setConsultorSearch(cons.nome_fantasia || cons.razao_social || cons.nome_completo || cons.email || '');
            }
        }
    }, [formData.consultor_id, consultants]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
    };

    // Robust Calculation Logic for Pro-rata
    const simulationData = useMemo(() => {
        if (!formData.data_inicio || !formData.valor_aporte || !formData.taxa_mensal) {
            return { rows: [], totalDividendos: 0, dataFim: '' };
        }

        const sim = calculateContractProjection(
            formData.valor_aporte,
            formData.taxa_mensal,
            formData.data_inicio,
            formData.periodo_meses,
            formData.dia_pagamento,
            0,
            0
        );

        // Convert the Simulation format to the local one used for rendering here
        const mappedRows = sim.clientPayments.map((p, index) => {
            const isCapital = p.type === 'Capital Return';
            return {
                parcela: isCapital ? '' : String(index + 1),
                dias: p.description.includes('dias') ? parseInt(p.description.replace(/\D/g, '')) || 0 : 0,
                valor: p.amount,
                data: new Date(p.date + 'T12:00:00'),
                tipo: isCapital ? 'Valor do aporte' : 'Dividendo'
            };
        });

        // The final row in mappedRows will be the Capital Return, so the total length - 1 are the dividends
        const rowsOutput = mappedRows.slice(0, -1);
        const finalRow = mappedRows[mappedRows.length - 1]; // We will render this the same way

        return {
            rows: rowsOutput,
            finalRow,
            totalDividendos: sim.summary.totalDividend,
            dataFim: sim.summary.endDate
        };
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!contractId && onSubmitDetails) {
                await onSubmitDetails({
                    clientId: formData.user_id,
                    amount: formData.valor_aporte,
                    rate: formData.taxa_mensal,
                    period: formData.periodo_meses,
                    startDate: formData.data_inicio,
                    paymentDay: formData.dia_pagamento,
                    sendMethod: signaturePreference,
                    consultorId: formData.consultor_id || (userProfile?.tipo_user === 'Consultor' ? userProfile.id : null)
                });
                return;
            }

            const url = contractId
                ? `${(import.meta as any).env.VITE_API_URL}/admin/contracts/${contractId}`
                : `${(import.meta as any).env.VITE_API_URL}/admin/contracts`;
            const method = contractId ? 'PUT' : 'POST';

            const payload: any = { ...formData, preferencia_assinatura: signaturePreference };
            if (!contractId && userProfile && userProfile.tipo_user === 'Consultor') {
                payload.consultor_id = userProfile.id;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                if (onSave) onSave();
                onBack();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-full space-y-6 bg-white p-6 md:p-8 min-h-screen">
            {/* Breadcrumbs & Actions Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <button onClick={onBack} className="flex items-center gap-1 hover:text-[#00A3B1] transition-colors group">
                        <Home size={14} className="text-slate-400 group-hover:text-[#00A3B1]" />
                    </button>
                    <span className="opacity-50 font-bold">{'>'}</span>
                    <button onClick={onBack} className="font-bold hover:text-[#00A3B1] transition-colors">Contratos</button>
                    <span className="opacity-50 font-bold">{'>'}</span>
                    <span className="text-[#00A3B1] font-bold">Cadastrar contratos</span>
                </div>

                <button className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">
                    <FileText size={18} />
                    Cadastrar novo contrato
                </button>
            </div>

            <h2 className="text-xl font-bold text-[#002B49] tracking-tight">Cadastrar contrato</h2>

            <form onSubmit={handleSubmit} className="space-y-10 w-full max-w-full">
                {/* 1: Preference */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-[#002B49] tracking-wide">Preferência de envio de link de assinatura</label>
                    <div className="flex gap-4 p-1 bg-[#F8FAFB] w-fit rounded-xl border border-slate-100">
                        {[
                            { id: 'Email', icon: Mail, label: 'Email' },
                            { id: 'Whatsapp', icon: MessageCircle, label: 'Whatsapp', color: 'text-green-500' },
                            { id: 'SMS', icon: MessageSquare, label: 'SMS' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setSignaturePreference(item.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${signaturePreference === item.id
                                    ? 'bg-white border text-[#002B49] border-slate-200 shadow-sm'
                                    : 'text-slate-500 hover:text-[#002B49]'}`}
                            >
                                <item.icon size={16} className={item.color && signaturePreference !== item.id ? item.color : (signaturePreference === item.id ? 'text-[#002B49]' : 'text-slate-400')} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2: Client Info */}
                <div className="space-y-5">
                    <h3 className="text-sm font-bold text-[#002B49]">Informações do cliente</h3>

                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#002B49]">Cliente <span className="text-[#00A3B1]">*</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                value={clienteSearch}
                                onChange={(e) => {
                                    setClienteSearch(e.target.value);
                                    setShowClienteDropdown(true);
                                    setFormData(prev => ({ ...prev, user_id: '' }));
                                }}
                                onFocus={() => setShowClienteDropdown(true)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                                placeholder="Digite para buscar (nome, CPF, CNPJ)..."
                                required={!formData.user_id}
                            />
                            {showClienteDropdown && (clienteSearch || filteredClients.length > 0) && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowClienteDropdown(false)}></div>
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto w-full">
                                        {filteredClients.length > 0 ? (
                                            filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setClienteSearch(c.nome_fantasia || c.razao_social || c.nome_completo || c.email || '');
                                                        setFormData(prev => ({ ...prev, user_id: c.id }));
                                                        setShowClienteDropdown(false);
                                                    }}
                                                    className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                                                >
                                                    <span className="font-bold text-[#002B49] text-sm">{c.nome_fantasia || c.razao_social || c.nome_completo || c.email}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">CPF/CNPJ: {c.cpf || c.cnpj || '--'} • Email: {c.email || '--'}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-5 py-4 text-center text-slate-400 text-sm">
                                                Nenhum cliente encontrado
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {clients.length === 0 && userProfile?.tipo_user === 'Consultor' && (
                            <p className="text-[11px] font-bold text-red-500 pt-1">Caro consultor, cadastre um cliente para que seja possível criar os contratos.</p>
                        )}
                    </div>

                    {/* Client Info Detailed Box (shown when specific client is selected) */}
                    {formData.user_id && clients.find(c => c.id === formData.user_id) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-8 border border-[#E6F6F7] rounded-xl bg-white grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden mt-4"
                        >
                            {(() => {
                                const userClient = clients.find(c => c.id === formData.user_id);
                                return (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[11px] font-bold text-[#002B49]">Nome</p>
                                                <p className="text-sm text-slate-500 font-medium">{userClient?.nome_fantasia || userClient?.razao_social || userClient?.nome_completo || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#002B49]">CNPJ/CPF</p>
                                                <p className="text-sm text-slate-500 font-medium">{userClient?.cpf_cnpj || userClient?.cpf || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#002B49]">Contato</p>
                                                <p className="text-sm text-slate-500 font-medium">{userClient?.celular || userClient?.telefone || userClient?.email || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[11px] font-bold text-[#002B49]">Banco</p>
                                                <p className="text-sm text-slate-500 font-medium">{userClient?.banco || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#002B49]">Agência</p>
                                                <p className="text-sm text-slate-500 font-medium">{userClient?.agencia_bancaria || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#002B49]">Conta</p>
                                                <p className="text-sm text-slate-500 font-medium">{userClient?.conta_bancaria || '-'}</p>
                                            </div>
                                        </div>
                                        {/* Warning Box */}
                                        <div className="mt-2 p-6 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl space-y-1 col-span-1 md:col-span-3">
                                            <p className="text-[11px] font-bold text-[#92400E] tracking-wider">Atenção:</p>
                                            <p className="text-xs text-[#B45309] font-medium leading-relaxed">Verifique se os dados do cliente estão atualizados.</p>
                                        </div>
                                    </>
                                )
                            })()}
                        </motion.div>
                    )}
                </div>

                {/* 3: Simulation Parameters in new Grid Format */}
                <div className="space-y-5">

                    {/* Produto */}
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#002B49]">
                            Produto <span className="text-[#00A3B1]">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="titulo"
                                value={formData.titulo}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.includes('(Em Breve)')) {
                                        setFeedback({
                                            type: 'warning',
                                            title: 'Produto em breve',
                                            message: 'Este produto ainda não está disponível para contratação. Selecione outra opção.'
                                        });
                                        setFormData(prev => ({ ...prev, titulo: '0001 - Câmbio' }));
                                        return;
                                    }
                                    setFormData(prev => ({ ...prev, titulo: value }));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] text-slate-500 transition-all cursor-pointer appearance-none"
                                required
                            >
                                <option value="0001 - Câmbio">0001 - Câmbio</option>
                                <option value="0002 - Recebíveis (Em Breve)">0002 - Recebíveis (Em Breve)</option>
                                <option value="0003 - Consignado (Em Breve)">0003 - Consignado (Em Breve)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight className="rotate-90" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Data Início */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[#002B49] flex items-center">
                                Data do aporte <span className="text-[#00A3B1] ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="data_inicio"
                                    value={formData.data_inicio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] text-slate-500 transition-all appearance-none cursor-pointer"
                                    required
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A3B1] pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* Admin Consultor Selector (Autocomplete) */}
                        {userProfile && (userProfile.tipo_user === 'Admin' || userProfile.tipo_user === 'Suporte' || userProfile.is_su) && (
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[#002B49] flex items-center">
                                    Consultor <span className="text-[#00A3B1] ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={consultorSearch}
                                        onChange={(e) => {
                                            setConsultorSearch(e.target.value);
                                            setShowConsultorDropdown(true);
                                            setFormData(prev => ({ ...prev, consultor_id: '' }));
                                        }}
                                        onFocus={() => setShowConsultorDropdown(true)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all"
                                        placeholder="Selecione o consultor"
                                        required={!formData.consultor_id}
                                    />
                                    {showConsultorDropdown && (consultorSearch || filteredConsultants.length > 0) && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowConsultorDropdown(false)}></div>
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto w-full">
                                                {filteredConsultants.length > 0 ? (
                                                    filteredConsultants.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setConsultorSearch(c.nome_fantasia || c.razao_social || c.nome_completo || c.email || '');
                                                                setFormData(prev => ({ ...prev, consultor_id: c.id }));
                                                                setShowConsultorDropdown(false);
                                                            }}
                                                            className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                                                        >
                                                            <span className="font-bold text-[#002B49] text-sm">{c.nome_fantasia || c.razao_social || c.nome_completo || c.email}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">Teto de comissão: {c.percentual_contrato || '5.0'}%</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-5 py-4 text-center text-slate-400 text-sm">
                                                        Nenhum consultor encontrado
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Aporte */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[#002B49] flex items-center">
                                Aporte <span className="text-[#00A3B1] ml-1">*</span>
                            </label>
                            <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#00A3B1]/10 focus-within:border-[#00A3B1] transition-all bg-white">
                                <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-sm font-bold flex items-center justify-center min-w-[50px]">
                                    R$
                                </div>
                                <input
                                    type="text"
                                    value={aporteDisplay}
                                    onChange={handleAporteChange}
                                    className="w-full px-4 py-3 focus:outline-none text-slate-500 text-[13px]"
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Rentabilidade */}
                        <div className="space-y-2 flex flex-col justify-start">
                            <label className="text-[12px] font-bold text-[#002B49] flex items-center">
                                Rentabilidade <span className="text-[#00A3B1] ml-1">*</span>
                            </label>
                            <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#00A3B1]/10 focus-within:border-[#00A3B1] transition-all bg-white mb-1">
                                <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center min-w-[60px] whitespace-nowrap">
                                    % a.m.
                                </div>
                                <input
                                    type="text"
                                    value={taxaDisplay}
                                    onChange={handleTaxaChange}
                                    className="w-full px-4 py-3 focus:outline-none text-slate-500 text-[13px]"
                                    placeholder="Digite a rentabilidade"
                                    required
                                />
                            </div>
                            {/* Validation warning */}
                            {userProfile?.tipo_user === 'Consultor' && formData.taxa_mensal < (userProfile.percentual_contrato ?? 5.0) && (
                                <p className="text-[11px] text-[#00A3B1] font-bold mt-1">Sua taxa de trabalho limite é de {userProfile.percentual_contrato ?? '5.0'}%.</p>
                            )}
                            {userProfile && (userProfile.tipo_user === 'Admin' || userProfile.tipo_user === 'Suporte' || userProfile.is_su) && formData.consultor_id && (() => {
                                const cons = consultants.find(c => c.id === formData.consultor_id);
                                if (cons && formData.taxa_mensal < (cons.percentual_contrato ?? 5.0)) {
                                    return <p className="text-[11px] text-[#00A3B1] font-bold mt-1">A taxa de trabalho limite deste consultor é de {cons.percentual_contrato ?? '5.0'}%.</p>;
                                }
                                return null;
                            })()}
                        </div>

                        {/* Período */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[#002B49] flex items-center">
                                Período <span className="text-[#00A3B1] ml-1">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="periodo_meses"
                                    value={formData.periodo_meses}
                                    onChange={(e) => setFormData(prev => ({ ...prev, periodo_meses: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] text-slate-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Selecione o período</option>
                                    {[6, 12, 18, 24, 30, 36].map(m => (
                                        <option key={m} value={m}>{m} meses</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronRight className="rotate-90" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Simulation Summary Table (if any data) */}
                <AnimatePresence>
                    {simulationData.rows.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 mt-10"
                        >
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-[16px] font-bold text-[#002B49] mb-1">Detalhes da Simulação</h2>
                                    <p className="text-slate-400 text-[14px]">
                                        Estes valores representam a projeção do contrato conforme os parâmetros informados no início da simulação.
                                    </p>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    {[
                                        { label: 'Rendimento', value: 'Mensal' },
                                        { label: 'Dia de pagamento', value: String(formData.dia_pagamento) },
                                        { label: 'Segundo pagamento', value: String(simulationData.rows[1]?.data.getDate() || formData.dia_pagamento) },
                                        { label: 'Fim do contrato', value: formatDate(new Date(simulationData.dataFim + 'T12:00:00')) }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 text-left">
                                            <p className="text-[14px] text-slate-500 mb-1">{stat.label}</p>
                                            <p className="text-[#00A3B1] font-bold text-[16px]">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Parcela</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Dias pro rata</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Valor do dividendo</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px]">Pagamento dividendo</th>
                                                <th className="px-6 py-4 font-normal text-slate-400 text-[14px] text-right">Tipo do dividendo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {simulationData.rows.map((row) => (
                                                <tr key={row.parcela} className="group transition-colors hover:bg-slate-50/50">
                                                    <td className="px-6 py-5 font-bold text-[#002B49] text-[14px]">{row.parcela}</td>
                                                    <td className="px-6 py-5 text-slate-600 text-[14px]">{row.dias || 0}</td>
                                                    <td className="px-6 py-5 font-bold text-[#002B49] text-[14px]">{formatCurrency(row.valor)}</td>
                                                    <td className="px-6 py-5 text-slate-600 text-[14px]">{formatDate(row.data)}</td>
                                                    <td className="px-6 py-5 text-right text-[14px] text-slate-500">{row.tipo}</td>
                                                </tr>
                                            ))}
                                            {/* Final row for principal */}
                                            <tr className="group transition-colors hover:bg-slate-50/50">
                                                <td className="px-6 py-5 font-bold text-[#002B49] text-[14px]"></td>
                                                <td className="px-6 py-5 text-slate-600 text-[14px]">0</td>
                                                <td className="px-6 py-5 font-bold text-[#002B49] text-[14px]">{formatCurrency(formData.valor_aporte)}</td>
                                                <td className="px-6 py-5 text-slate-600 text-[14px]">{formatDate(new Date(simulationData.dataFim + 'T12:00:00'))}</td>
                                                <td className="px-6 py-5 text-right text-[14px] text-slate-500">Valor do aporte</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-100 mt-10">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-[#002B49] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[13px] font-bold text-white shadow-xl shadow-[#00A3B1]/20 transition-all active:scale-95
                            ${loading ? 'bg-slate-300 opacity-70 cursor-not-allowed' : 'bg-[#00A3B1] hover:bg-[#008c99]'}`}
                    >
                        {loading ? 'Enviando...' : (
                            <>
                                <Check size={16} strokeWidth={3} />
                                Enviar contrato
                            </>
                        )}
                    </button>
                </div>
            </form>

            <FeedbackModal
                data={feedback}
                onClose={() => setFeedback(null)}
            />
        </div>
    );
};

export default ContractForm;
