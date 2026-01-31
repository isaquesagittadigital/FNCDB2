
import React, { useState, useEffect } from 'react';
import { Save, User, Building2, ChevronRight, CheckCircle } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { z } from 'zod';

interface ClientGeneralFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    wizardMode?: boolean;
}

const ClientGeneralForm: React.FC<ClientGeneralFormProps> = ({ initialData, onSubmit, loading, wizardMode = false }) => {
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
        empresa: 'FNCD Capital',
        email: '',
        email_alternativo: '',
        celular: '',
        telefone_principal: '',
        telefone_secundario: '',
        consultant_id: ''
    });

    const [consultants, setConsultants] = useState<any[]>([]);

    useEffect(() => {
        // Fetch consultants
        fetch(`${import.meta.env.VITE_API_URL}/admin/consultants`)
            .then(res => res.json())
            .then(data => setConsultants(data || []))
            .catch(err => console.error("Failed to fetch consultants", err));
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleMaskChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Custom simple validation
        if (formData.tipo_cliente === 'Pessoa Física') {
            if (!formData.cpf || !formData.nome_fantasia || !formData.email) {
                alert('Preencha os campos obrigatórios (CPF, Nome, Email)!');
                return;
            }
        } else {
            if (!formData.cnpj || !formData.razao_social || !formData.email) {
                alert('Preencha os campos obrigatórios (CNPJ, Razão Social, Email)!');
                return;
            }
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Client Type */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Tipo de cliente</h3>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipo_cliente: 'Pessoa Física' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.tipo_cliente === 'Pessoa Física'
                            ? 'bg-[#E6F6F7] border-[#00A3B1] text-[#00A3B1]'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <User size={16} />
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
                                <IMaskInput
                                    mask="000.000.000-00"
                                    value={formData.cpf}
                                    onAccept={(value) => handleMaskChange('cpf', value)}
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Nome completo <span className="text-red-500">*</span></label>
                                <input
                                    name="nome_fantasia"
                                    value={formData.nome_fantasia}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Data de nascimento <span className="text-red-500">*</span></label>
                                <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                            </div>

                            {/* Consultant Selection at Top Level for Visibility */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Consultor Responsável <span className="text-red-500">*</span></label>
                                <select
                                    name="consultant_id"
                                    value={formData.consultant_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-white"
                                >
                                    <option value="">Selecione um consultor</option>
                                    {consultants.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Sexo <span className="text-red-500">*</span></label>
                                <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                                    <option value="">Selecione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Nacionalidade <span className="text-red-500">*</span></label>
                                <input name="nacionalidade" value={formData.nacionalidade} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">CNPJ <span className="text-red-500">*</span></label>
                                <IMaskInput
                                    mask="00.000.000/0000-00"
                                    value={formData.cnpj}
                                    onAccept={(value) => handleMaskChange('cnpj', value)}
                                    placeholder="00.000.000/0000-00"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Razão Social <span className="text-red-500">*</span></label>
                                <input name="razao_social" value={formData.razao_social} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Nome Fantasia <span className="text-red-500">*</span></label>
                                <input name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                            </div>
                            {/* Consultant Selection for PJ */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Consultor Responsável <span className="text-red-500">*</span></label>
                                <select
                                    name="consultant_id"
                                    value={formData.consultant_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-white"
                                >
                                    <option value="">Selecione um consultor</option>
                                    {consultants.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome_fantasia}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* Identity Section */}
                <h4 className="text-xs font-bold text-slate-400 uppercase mt-6 mb-4">Identidade & Diversos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">RG</label>
                        <input name="rg" value={formData.rg} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">UF RG</label>
                        <select name="uf_rg" value={formData.uf_rg} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                            <option value="">UF</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            <option value="MG">MG</option>
                            {/* Populate full list later */}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Órgão Emissor</label>
                        <select name="orgao_emissor" value={formData.orgao_emissor} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                            <option value="">Selecione</option>
                            <option value="SSP">SSP</option>
                            <option value="DETRAN">DETRAN</option>
                            <option value="PF">PF</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Estado Civil</label>
                        <select name="estado_civil" value={formData.estado_civil} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200">
                            <option value="">Selecione</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado(a)">Casado(a)</option>
                            <option value="Divorciado(a)">Divorciado(a)</option>
                            <option value="Viúvo(a)">Viúvo(a)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Profissão</label>
                        <input name="profissao" value={formData.profissao} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
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
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Email alternativo (opcional)</label>
                        <input name="email_alternativo" type="email" value={formData.email_alternativo} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200" placeholder="Informe outro email" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Celular <span className="text-red-500">*</span></label>
                        <IMaskInput
                            mask="(00) 00000-0000"
                            value={formData.celular}
                            onAccept={(value) => handleMaskChange('celular', value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Telefone principal (opcional)</label>
                        <IMaskInput
                            mask="(00) 0000-0000"
                            value={formData.telefone_principal}
                            onAccept={(value) => handleMaskChange('telefone_principal', value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200"
                            placeholder="Informe o telefone"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Telefone secundário (opcional)</label>
                        <IMaskInput
                            mask="(00) 0000-0000"
                            value={formData.telefone_secundario}
                            onAccept={(value) => handleMaskChange('telefone_secundario', value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200"
                            placeholder="Informe o telefone secundário"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : (wizardMode ? 'bg-[#00A3B1] hover:bg-[#008c99]' : 'bg-[#002B49] hover:bg-[#00385D]')}`}
                >
                    {wizardMode ? <CheckCircle size={18} /> : <Save size={18} />}
                    {loading ? 'Processando...' : (wizardMode ? 'Continuar' : 'Salvar')}
                </button>
            </div>
        </form>
    );
};

export default ClientGeneralForm;
