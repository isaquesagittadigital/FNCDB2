
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface ClientGeneralFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
}

const ClientGeneralForm: React.FC<ClientGeneralFormProps> = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        tipo_cliente: 'Pessoa Física',
        cpf: '',
        cnpj: '',
        nome_fantasia: '', // Nome completo for PF
        razao_social: '',
        data_nascimento: '',
        sexo: '',
        nacionalidade: '',
        rg: '',
        uf_rg: '',
        orgao_emissor: '',
        estado_civil: '',
        profissao: '',
        ppe: false,
        empresa: 'FNCD Capital', // Fixed per image
        email: '',
        email_alternativo: '',
        celular: '',
        telefone_principal: '',
        telefone_secundario: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Client Type */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Tipo de cliente</h3>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipo_cliente: 'Pessoa Física' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.tipo_cliente === 'Pessoa Física'
                                ? 'bg-[#E6F6F7] border-[#00A3B1] text-[#00A3B1]'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <User size={16} /> {/* Assume User icon imported globally or locally */}
                        Pessoa física
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipo_cliente: 'Pessoa Jurídica' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.tipo_cliente === 'Pessoa Jurídica'
                                ? 'bg-[#E6F6F7] border-[#00A3B1] text-[#00A3B1]'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <Building2 size={16} />
                        Pessoa jurídica
                    </button>
                </div>
            </div>

            {/* Client Info Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Informações do cliente</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {formData.tipo_cliente === 'Pessoa Física' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Documento (CPF) <span className="text-red-500">*</span></label>
                                <input
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-500">Nome completo <span className="text-red-500">*</span></label>
                                <input
                                    name="nome_fantasia"
                                    value={formData.nome_fantasia}
                                    onChange={handleChange}
                                    placeholder="Informe o nome completo"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Data de nascimento <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="data_nascimento"
                                    value={formData.data_nascimento}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Sexo <span className="text-red-500">*</span></label>
                                <select
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                >
                                    <option value="">Selecione o sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                    <option value="O">Outro</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Nacionalidade <span className="text-red-500">*</span></label>
                                <input
                                    name="nacionalidade"
                                    value={formData.nacionalidade}
                                    onChange={handleChange}
                                    placeholder="Brasileiro(a)"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">CNPJ <span className="text-red-500">*</span></label>
                                <input
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    placeholder="00.000.000/0000-00"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Razão Social <span className="text-red-500">*</span></label>
                                <input
                                    name="razao_social"
                                    value={formData.razao_social}
                                    onChange={handleChange}
                                    placeholder="Razão Social Ltda"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Nome Fantasia <span className="text-red-500">*</span></label>
                                <input
                                    name="nome_fantasia"
                                    value={formData.nome_fantasia}
                                    onChange={handleChange}
                                    placeholder="Nome Fantasia"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Identity Section */}
                <h4 className="text-xs font-bold text-slate-400 uppercase mt-6 mb-4">Identidade</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">RG <span className="text-red-500">*</span></label>
                        <input
                            name="rg"
                            value={formData.rg}
                            onChange={handleChange}
                            placeholder="RG / IE"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">UF RG <span className="text-red-500">*</span></label>
                        <select
                            name="uf_rg"
                            value={formData.uf_rg}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        >
                            <option value="">Selecione</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            {/* Add others as needed */}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Órgão Emissor <span className="text-red-500">*</span></label>
                        <select
                            name="orgao_emissor"
                            value={formData.orgao_emissor}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        >
                            <option value="">Selecione</option>
                            <option value="SSP">SSP</option>
                            <option value="DETRAN">DETRAN</option>
                        </select>
                    </div>
                </div>

                {/* Misc Section */}
                <h4 className="text-xs font-bold text-slate-400 uppercase mt-6 mb-4">Informações diversas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Estado Civil <span className="text-red-500">*</span></label>
                        <select
                            name="estado_civil"
                            value={formData.estado_civil}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        >
                            <option value="">Selecione o estado civil</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado(a)">Casado(a)</option>
                            <option value="Divorciado(a)">Divorciado(a)</option>
                            <option value="Viúvo(a)">Viúvo(a)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Profissão <span className="text-red-500">*</span></label>
                        <input
                            name="profissao"
                            value={formData.profissao}
                            onChange={handleChange}
                            placeholder="Informe a profissão"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="text-xs font-semibold text-slate-500">PPE</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="ppe"
                                checked={formData.ppe === true}
                                onChange={() => setFormData(prev => ({ ...prev, ppe: true }))}
                                className="text-[#00A3B1] focus:ring-[#00A3B1]"
                            />
                            <span className="text-sm text-slate-600">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="ppe"
                                checked={formData.ppe === false}
                                onChange={() => setFormData(prev => ({ ...prev, ppe: false }))}
                                className="text-[#00A3B1] focus:ring-[#00A3B1]"
                            />
                            <span className="text-sm text-slate-600">Não</span>
                        </label>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Empresa <span className="text-red-500">*</span></label>
                    <select
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                    >
                        <option value="FNCD Capital">FNCD Capital</option>
                    </select>
                </div>

                {/* Contact Section */}
                <h4 className="text-xs font-bold text-slate-400 uppercase mt-6 mb-4">Informações de contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Email <span className="text-red-500">*</span></label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Informe o email"
                            type="email"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Celular <span className="text-red-500">*</span></label>
                        <input
                            name="celular"
                            value={formData.celular}
                            onChange={handleChange}
                            placeholder="Informe o celular"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-cyan-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    {loading ? 'Salvando...' : 'Salvar informações'}
                </button>
            </div>
        </form>
    );
};

import { User, Building2 } from 'lucide-react'; // Import at top
export default ClientGeneralForm;
