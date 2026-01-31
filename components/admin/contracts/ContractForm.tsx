
import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Calendar, FileText, User, DollarSign, BarChart } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface ContractFormProps {
    contractId?: string | null;
    onBack: () => void;
    onSave?: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ contractId, onBack, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        user_id: '',
        titulo: '', // Product
        status: 'Rascunho',
        valor_aporte: 0, // Amount
        taxa_mensal: '', // Rate
        periodo_meses: 6,
        data_inicio: '',
        data_fim: '',
        arquivo_url: ''
    });

    useEffect(() => {
        // Fetch clients for dropdown
        fetch(`${import.meta.env.VITE_API_URL}/admin/clients`)
            .then(res => res.json())
            .then(data => setClients(data || []))
            .catch(err => console.error("Failed to fetch clients", err));

        if (contractId) {
            fetchContractData(contractId);
        }
    }, [contractId]);

    const fetchContractData = async (id: string) => {
        setLoading(true);
        try {
            // We can reuse the list endpoint but filtering or just fetch specific if we had GET /contracts/:id
            // Currently getting from list might be inefficient but we don't have single GET global endpoint yet?
            // Actually usually we should have GET /contracts/:id.
            // But let's check admin.routes.ts... we didn't add GET /contracts/:id explicitly, only GET /contracts (list).
            // AND we have GET /clients/:id/contracts for specific client.
            // Let's add GET /contracts/:id quickly to admin.routes.ts OR just iterate the list since we don't have it.
            // Wait, PUT /contracts/:id exists. DELETE /contracts/:id exists.
            // GET /contracts returns all.
            // For now, let's just fetch all and find (not ideal but works for MVP) OR fetch from client endpoint if we knew the client.
            // BUT easier: just add GET /contracts/:id to backend ?
            // No, avoid context switching. Let's list all and find, OR assume we pass data in.
            // Better: Fetch all and find.
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
                        taxa_mensal: contract.taxa_mensal || '',
                        periodo_meses: contract.periodo_meses || 6,
                        data_inicio: contract.data_inicio ? contract.data_inicio.split('T')[0] : '', // format date
                        data_fim: contract.data_fim ? contract.data_fim.split('T')[0] : '',
                        arquivo_url: contract.arquivo_url || ''
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch contract", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.user_id || !formData.titulo) {
            alert('Cliente e Título/Produto são obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const url = contractId
                ? `${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}`
                : `${import.meta.env.VITE_API_URL}/admin/contracts`;

            const method = contractId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Contrato salvo com sucesso!');
                if (onSave) onSave();
                onBack();
            } else {
                const err = await res.json();
                alert(`Erro ao salvar: ${err.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#002B49] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                            <span>Contratos</span>
                            <span>›</span>
                            <span>{contractId ? 'Editar contrato' : 'Cadastrar contrato'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#002B49]">
                            {contractId ? 'Editar contrato' : 'Novo Contrato'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-8 flex-1 bg-[#FDFDFD]">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Cliente <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <select
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    disabled={!!contractId} // Prevent changing client on edit for safety? Or allow it.
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-white disabled:bg-slate-50"
                                >
                                    <option value="">Selecione o Cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.nome_fantasia || client.razao_social || 'Cliente sem nome'} ({client.cpf || client.cnpj})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Produto <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <select
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-white"
                                    >
                                        <option value="">Selecione o produto</option>
                                        <option value="0001 - Câmbio">0001 - Câmbio</option>
                                        <option value="0002 - Crédito Privado">0002 - Crédito Privado</option>
                                        <option value="0003 - Fundo Exclusivo">0003 - Fundo Exclusivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-white"
                                >
                                    <option value="Rascunho">Rascunho</option>
                                    <option value="Em processo">Em processo</option>
                                    <option value="Vigente">Vigente</option>
                                    <option value="Cancelado">Cancelado</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Valor do Aporte</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        name="valor_aporte"
                                        value={formData.valor_aporte}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Taxa Mensal (%)</label>
                                <div className="relative">
                                    <BarChart className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        name="taxa_mensal"
                                        value={formData.taxa_mensal}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                        placeholder="0.00%"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Período (Meses)</label>
                                <input
                                    type="number"
                                    name="periodo_meses"
                                    value={formData.periodo_meses}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Data Início</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        name="data_inicio"
                                        value={formData.data_inicio}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Data Fim</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        name="data_fim"
                                        value={formData.data_fim}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg
                                ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#002B49] hover:bg-[#00385D]'}`}
                        >
                            <Save size={18} />
                            {loading ? 'Processando...' : 'Salvar Contrato'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContractForm;
