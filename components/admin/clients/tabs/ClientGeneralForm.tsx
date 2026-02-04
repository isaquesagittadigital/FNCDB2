import React, { useState, useEffect } from 'react';
import { Field, FormSection, SelectField } from '../../../shared/ui/FormElements';
import SuccessModal from '../../../shared/modals/SuccessModal';
import { User, Building2, CheckCircle } from 'lucide-react';

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


    // Handlers
    const updateForm = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
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
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-500">
            {/* Client Type Selector */}
            <div className="bg-[#F8FAFB] p-1.5 rounded-xl inline-flex gap-1 border border-slate-100">
                <button
                    type="button"
                    onClick={() => updateForm('tipo_cliente', 'Pessoa Física')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.tipo_cliente === 'Pessoa Física'
                        ? 'bg-white text-[#00A3B1] shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <User size={18} />
                    Pessoa Física
                </button>
                <button
                    type="button"
                    onClick={() => updateForm('tipo_cliente', 'Pessoa Jurídica')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.tipo_cliente === 'Pessoa Jurídica'
                        ? 'bg-white text-[#00A3B1] shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Building2 size={18} />
                    Pessoa Jurídica
                </button>
            </div>

            {/* Identidade */}
            <FormSection title={formData.tipo_cliente === 'Pessoa Física' ? 'Informações Pessoais' : 'Informações da Empresa'}>
                {formData.tipo_cliente === 'Pessoa Física' ? (
                    <>
                        <Field
                            label="Nome completo"
                            value={formData.nome_fantasia}
                            onChange={(val) => updateForm('nome_fantasia', val)}
                            required
                            placeholder="Nome completo do cliente"
                        />
                        <Field
                            label="CPF"
                            value={formData.cpf}
                            onChange={(val) => updateForm('cpf', val)}
                            mask="000.000.000-00"
                            required
                            placeholder="000.000.000-00"
                        />
                        <Field
                            label="RG"
                            value={formData.rg}
                            onChange={(val) => updateForm('rg', val)}
                            placeholder="Número do RG"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <SelectField
                                label="UF Emissor"
                                value={formData.uf_rg}
                                onChange={(val) => updateForm('uf_rg', val)}
                                options={[
                                    { value: 'SP', label: 'SP' },
                                    { value: 'RJ', label: 'RJ' },
                                    { value: 'MG', label: 'MG' },
                                    // Add more UFs
                                ]}
                            />
                            <SelectField
                                label="Órgão"
                                value={formData.orgao_emissor}
                                onChange={(val) => updateForm('orgao_emissor', val)}
                                options={[
                                    { value: 'SSP', label: 'SSP' },
                                    { value: 'DETRAN', label: 'DETRAN' },
                                    { value: 'PF', label: 'PF' },
                                ]}
                            />
                        </div>
                        <Field
                            label="Data de nascimento"
                            type="date"
                            value={formData.data_nascimento}
                            onChange={(val) => updateForm('data_nascimento', val)}
                            required
                        />
                        <SelectField
                            label="Sexo"
                            value={formData.sexo}
                            onChange={(val) => updateForm('sexo', val)}
                            required
                            options={[
                                { value: 'M', label: 'Masculino' },
                                { value: 'F', label: 'Feminino' }
                            ]}
                        />
                        <SelectField
                            label="Estado Civil"
                            value={formData.estado_civil}
                            onChange={(val) => updateForm('estado_civil', val)}
                            options={[
                                { value: 'Solteiro(a)', label: 'Solteiro(a)' },
                                { value: 'Casado(a)', label: 'Casado(a)' },
                                { value: 'Divorciado(a)', label: 'Divorciado(a)' },
                                { value: 'Viúvo(a)', label: 'Viúvo(a)' }
                            ]}
                        />
                        <Field
                            label="Nacionalidade"
                            value={formData.nacionalidade}
                            onChange={(val) => updateForm('nacionalidade', val)}
                            placeholder="Brasileira"
                        />
                        <Field
                            label="Profissão"
                            value={formData.profissao}
                            onChange={(val) => updateForm('profissao', val)}
                            placeholder="Opcional"
                        />
                        <div className="col-span-1 md:col-span-2 space-y-2 pt-2">
                            <label className="text-sm font-bold text-[#002B49]">Pessoa Politicamente Exposta (PPE)</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="ppe" checked={formData.ppe === true} onChange={() => updateForm('ppe', true)} className="text-[#00A3B1] focus:ring-[#00A3B1]" />
                                    <span className="text-sm text-slate-600">Sim</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="ppe" checked={formData.ppe === false} onChange={() => updateForm('ppe', false)} className="text-[#00A3B1] focus:ring-[#00A3B1]" />
                                    <span className="text-sm text-slate-600">Não</span>
                                </label>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Field
                            label="CNPJ"
                            value={formData.cnpj}
                            onChange={(val) => updateForm('cnpj', val)}
                            mask="00.000.000/0000-00"
                            required
                        />
                        <Field
                            label="Razão Social"
                            value={formData.razao_social}
                            onChange={(val) => updateForm('razao_social', val)}
                            required
                        />
                        <Field
                            label="Nome Fantasia"
                            value={formData.nome_fantasia}
                            onChange={(val) => updateForm('nome_fantasia', val)}
                            required
                        />
                        {/* Add PJ specific fields if any */}
                    </>
                )}
            </FormSection>

            {/* Vínculo */}
            <FormSection title="Vínculo Institucional">
                <SelectField
                    label="Consultor Responsável"
                    value={formData.consultant_id}
                    onChange={(val) => updateForm('consultant_id', val)}
                    required
                    options={consultants.map(c => ({ value: c.id, label: c.nome_fantasia }))}
                    placeholder="Selecione um consultor"
                />
                <SelectField
                    label="Empresa"
                    value={formData.empresa}
                    onChange={(val) => updateForm('empresa', val)}
                    required
                    options={[{ value: 'FNCD Capital', label: 'FNCD Capital' }]}
                />
            </FormSection>

            {/* Contato */}
            <FormSection title="Informações de Contato">
                <Field
                    label="Email Principal"
                    value={formData.email}
                    onChange={(val) => updateForm('email', val)}
                    required
                    type="email"
                />
                <Field
                    label="Email Alternativo"
                    value={formData.email_alternativo}
                    onChange={(val) => updateForm('email_alternativo', val)}
                    type="email"
                    placeholder="Opcional"
                />
                <Field
                    label="Celular / WhatsApp"
                    value={formData.celular}
                    onChange={(val) => updateForm('celular', val)}
                    mask="(00) 00000-0000"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Telefone (Principal)"
                        value={formData.telefone_principal}
                        onChange={(val) => updateForm('telefone_principal', val)}
                        mask="(00) 0000-0000"
                    />
                    <Field
                        label="Telefone (Secundário)"
                        value={formData.telefone_secundario}
                        onChange={(val) => updateForm('telefone_secundario', val)}
                        mask="(00) 0000-0000"
                    />
                </div>
            </FormSection>

            <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#00A3B1]/20 active:scale-95
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00A3B1] hover:bg-[#008c99]'}`}
                >
                    <CheckCircle size={20} />
                    {loading ? 'Salvando...' : 'Continuar'}
                </button>
            </div>
        </form>
    );

};

export default ClientGeneralForm;
