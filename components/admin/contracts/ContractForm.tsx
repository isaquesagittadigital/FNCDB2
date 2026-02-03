
import React, { useState, useEffect, useMemo } from 'react';
import { Save, ArrowLeft, Calendar, FileText, User, DollarSign, BarChart, Mail, MessageCircle, MessageSquare, Check, X, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContractFormProps {
    contractId?: string | null;
    onBack: () => void;
    onSave?: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ contractId, onBack, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [signaturePreference, setSignaturePreference] = useState<'Email' | 'Whatsapp' | 'SMS'>('Email');

    const [formData, setFormData] = useState({
        user_id: '',
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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients`);
            if (res.ok) {
                const data = await res.json();
                setClients(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch clients", err);
        }
    };

    const fetchContractData = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts`);
            if (res.ok) {
                const data = await res.json();
                const contract = data.find((c: any) => c.id === id);
                if (contract) {
                    setFormData({
                        user_id: contract.user_id,
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
        }
    }, [formData.user_id, clients]);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setFormData(prev => ({ ...prev, user_id: id }));
    };

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

        const startDate = new Date(formData.data_inicio + 'T12:00:00');
        const rows = [];
        let totalDividendos = 0;

        const baseMonthlyValue = formData.valor_aporte * (formData.taxa_mensal / 100);

        for (let i = 1; i <= formData.periodo_meses; i++) {
            // First payment is usually the dia_pagamento of the month AFTER start
            const payDate = new Date(startDate);
            payDate.setMonth(startDate.getMonth() + i);
            payDate.setDate(formData.dia_pagamento);

            let currentDividendo = baseMonthlyValue;
            let diasProRata = 0;

            if (i === 1) {
                // Days from startDate to first payDate
                const diffTime = Math.abs(payDate.getTime() - startDate.getTime());
                diasProRata = Math.round(diffTime / (1000 * 60 * 60 * 24));
                currentDividendo = (baseMonthlyValue / 30) * diasProRata;
            } else if (i === formData.periodo_meses) {
                // Final period: from last payDate to dataFim
                const lastPayDate = new Date(startDate);
                lastPayDate.setMonth(startDate.getMonth() + i - 1);
                lastPayDate.setDate(formData.dia_pagamento);

                const dataFim = new Date(startDate);
                dataFim.setMonth(startDate.getMonth() + formData.periodo_meses);

                const diffTime = Math.abs(dataFim.getTime() - lastPayDate.getTime());
                diasProRata = Math.round(diffTime / (1000 * 60 * 60 * 24));
                currentDividendo = (baseMonthlyValue / 30) * diasProRata;

                // Final payout date is the dataFim
                payDate.setTime(dataFim.getTime());
            }

            totalDividendos += currentDividendo;

            rows.push({
                parcela: i,
                dias: diasProRata,
                valor: currentDividendo,
                data: new Date(payDate),
                tipo: 'Dividendo'
            });
        }

        const finalDate = new Date(startDate.getTime());
        finalDate.setMonth(startDate.getMonth() + formData.periodo_meses);

        return { rows, totalDividendos, dataFim: finalDate.toISOString().split('T')[0] };
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = contractId
                ? `${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}`
                : `${import.meta.env.VITE_API_URL}/admin/contracts`;
            const method = contractId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, preferencia_assinatura: signaturePreference })
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
        <div className="bg-[#F8FAFB] min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors" onClick={onBack}>
                        <ArrowLeft size={14} />
                    </div>
                    <span>Contratos</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-600 font-medium">Cadastrar contratos</span>
                </div>

                <h1 className="text-2xl font-bold text-[#002B49]">Cadastrar contrato</h1>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-10">
                        {/* Section 1: Preference */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-[#002B49]">Preferência de envio de link de assinatura</h2>
                            <div className="flex gap-4">
                                {[
                                    { id: 'Email', icon: Mail, label: 'Email' },
                                    { id: 'Whatsapp', icon: MessageCircle, label: 'Whatsapp', extra: '(Em Breve)' },
                                    { id: 'SMS', icon: MessageSquare, label: 'SMS' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSignaturePreference(item.id as any)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all ${signaturePreference === item.id
                                            ? 'border-[#009BB6] bg-[#009BB6]/5 text-[#009BB6] shadow-sm ring-1 ring-[#009BB6]'
                                            : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        <item.icon size={18} className={signaturePreference === item.id ? 'text-[#009BB6]' : 'text-slate-300'} />
                                        <span className="text-sm font-medium">
                                            {item.label}
                                            {item.extra && <span className="ml-1 text-[10px] opacity-60 uppercase">{item.extra}</span>}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Client Info */}
                        <div className="space-y-8">
                            <h2 className="text-sm font-bold text-[#002B49] border-b border-slate-100 pb-2">Informações do cliente</h2>

                            <div className="space-y-2">
                                <label className="text-[13px] font-medium text-slate-500">
                                    Cliente <span className="text-[#009BB6]">*</span>
                                </label>
                                <select
                                    value={formData.user_id}
                                    onChange={handleClientChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] transition-all text-slate-700 bg-white"
                                >
                                    <option value="">Selecione o Cliente</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Client Detail Card */}
                            <AnimatePresence>
                                {selectedClient && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-[#009BB6]/5 border border-[#009BB6]/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative"
                                    >
                                        <div className="md:col-span-12">
                                            <div className="text-[12px] font-bold text-[#009BB6] uppercase mb-4">Cliente</div>
                                        </div>

                                        <div className="md:col-span-4 space-y-3">
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">Nome</div>
                                                <div className="text-sm font-bold text-[#002B49]">{selectedClient.nome_fantasia || selectedClient.razao_social}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">CNPJ/CPF</div>
                                                <div className="text-sm font-bold text-[#002B49]">{selectedClient.cnpj || selectedClient.cpf}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">Celular</div>
                                                <div className="text-sm font-bold text-[#002B49]">{selectedClient.celular || 'Não informado'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">Email</div>
                                                <div className="text-sm font-bold text-[#002B49] truncate">{selectedClient.email}</div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-5 space-y-3">
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">Tipo de conta</div>
                                                <div className="text-sm font-bold text-[#002B49]">Corrente</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">Cód. Banco</div>
                                                <div className="text-sm font-bold text-[#002B49]">159 - Casa do Crédito S.A.</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-slate-400 font-medium uppercase">Agência</div>
                                                <div className="text-sm font-bold text-[#002B49]">0000 - 0</div>
                                            </div>
                                            <div className="flex gap-8">
                                                <div>
                                                    <div className="text-[11px] text-slate-400 font-medium uppercase">Conta</div>
                                                    <div className="text-sm font-bold text-[#002B49]">00000000</div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-slate-400 font-medium uppercase">Dígito</div>
                                                    <div className="text-sm font-bold text-[#002B49]">0</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3">
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 h-fit">
                                                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold text-amber-900">Atenção:</div>
                                                    <p className="text-xs text-amber-700 leading-relaxed">Verifique se os dados do cliente estão atualizados.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Product selection */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-medium text-slate-500">
                                    Produto <span className="text-[#009BB6]">*</span>
                                </label>
                                <select
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] transition-all text-slate-700 bg-white"
                                >
                                    <option value="0001 - Câmbio">0001 - Câmbio</option>
                                </select>
                            </div>

                            {/* Date and Consultant */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[13px] font-medium text-slate-500">
                                        Data do aporte <span className="text-[#009BB6]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="data_inicio"
                                            value={formData.data_inicio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] transition-all text-slate-700"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#009BB6] pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div className="md:col-span-8 space-y-2">
                                    <label className="text-[13px] font-medium text-slate-500">
                                        Consultor <span className="text-[#009BB6]">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] transition-all text-slate-700 bg-white"
                                    >
                                        <option value="">Selecione o consultor</option>
                                        <option value="Samuel Alves">Samuel Alves</option>
                                    </select>
                                </div>
                            </div>

                            {/* Investment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-5 space-y-2">
                                    <label className="text-[13px] font-medium text-slate-500">
                                        Aporte <span className="text-[#009BB6]">*</span>
                                    </label>
                                    <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#009BB6]/10 focus-within:border-[#009BB6] transition-all">
                                        <div className="px-4 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-sm font-bold flex items-center justify-center min-w-[70px]">R$</div>
                                        <input
                                            type="text"
                                            value={aporteDisplay}
                                            onChange={handleAporteChange}
                                            className="w-full px-4 py-3 focus:outline-none text-slate-700"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[13px] font-medium text-slate-500">
                                        Rentabilidade <span className="text-[#009BB6]">*</span>
                                    </label>
                                    <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#009BB6]/10 focus-within:border-[#009BB6] transition-all">
                                        <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-400 text-[10px] font-bold uppercase flex items-center justify-center min-w-[75px] whitespace-nowrap">% a.m.</div>
                                        <input
                                            type="text"
                                            value={taxaDisplay}
                                            onChange={handleTaxaChange}
                                            className="w-full px-4 py-3 focus:outline-none text-slate-700"
                                            placeholder="Digite a rentabilidade"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[13px] font-medium text-slate-500">
                                        Período <span className="text-[#009BB6]">*</span>
                                    </label>
                                    <select
                                        name="periodo_meses"
                                        value={formData.periodo_meses}
                                        onChange={(e) => setFormData(prev => ({ ...prev, periodo_meses: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/10 focus:border-[#009BB6] transition-all text-slate-700 bg-white"
                                    >
                                        {[6, 12, 18, 24, 30, 36].map(m => (
                                            <option key={m} value={m}>{m} meses</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Projeção */}
                        <AnimatePresence>
                            {simulationData.rows.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-10 space-y-10 border-t border-slate-100"
                                >
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Rendimento', value: 'Mensal' },
                                            { label: 'Dia de pagamento', value: '10' },
                                            { label: 'Segundo pagamento', value: '10' },
                                            { label: 'Fim do contrato', value: formatDate(new Date(simulationData.dataFim + 'T12:00:00')) }
                                        ].map((stat, idx) => (
                                            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                                                <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">{stat.label}</div>
                                                <div className="text-[16px] font-bold text-[#009BB6]">{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Schedule Table */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-50 bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <th className="px-6 py-4">Parcela</th>
                                                    <th className="px-6 py-4">Dias pro rata</th>
                                                    <th className="px-6 py-4">Valor do dividendo</th>
                                                    <th className="px-6 py-4">Data pagamento dividendo</th>
                                                    <th className="px-6 py-4">Tipo do dividendo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {simulationData.rows.map((row) => (
                                                    <tr key={row.parcela} className="text-sm text-slate-600 hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-800">{row.parcela}</td>
                                                        <td className="px-6 py-4">{row.dias || 0}</td>
                                                        <td className="px-6 py-4 font-bold text-[#002B49]">{formatCurrency(row.valor)}</td>
                                                        <td className="px-6 py-4">{formatDate(row.data)}</td>
                                                        <td className="px-6 py-4">{row.tipo}</td>
                                                    </tr>
                                                ))}
                                                {/* Final row for principal */}
                                                <tr className="bg-slate-50/30 text-sm font-bold">
                                                    <td className="px-6 py-4"></td>
                                                    <td className="px-6 py-4">0</td>
                                                    <td className="px-6 py-4 text-[#002B49]">{formatCurrency(formData.valor_aporte)}</td>
                                                    <td className="px-6 py-4">{formatDate(new Date(simulationData.dataFim + 'T12:00:00'))}</td>
                                                    <td className="px-6 py-4 text-slate-400">Valor do aporte</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex justify-end items-center gap-4 pt-6">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-8 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95
                                    ${loading ? 'bg-slate-400' : 'bg-[#009BB6] hover:bg-[#008f9e]'}`}
                            >
                                <Check size={18} />
                                {loading ? 'Enviando...' : 'Enviar contrato'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContractForm;
