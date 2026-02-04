import React, { useState, useEffect } from 'react';
import { Field, FormSection } from '../../../shared/ui/FormElements';
import { CheckCircle, Building2 } from 'lucide-react';

interface ConsultantGeneralFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
}

const ConsultantGeneralForm: React.FC<ConsultantGeneralFormProps> = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        tipo_user: 'Consultor',
        tipo_cliente: 'Pessoa Jurídica',
        cpf: '',
        cnpj: '',
        razao_social: '',
        nome_fantasia: '',
        email: '',
        celular: '',
        telefone_principal: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData, tipo_cliente: 'Pessoa Jurídica' }));
        }
    }, [initialData]);

    const updateForm = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cnpj || !formData.razao_social || !formData.email) {
            alert('Preencha os campos obrigatórios (CNPJ, Razão Social e Email)!');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-500">
            <FormSection title="Informações da Empresa">
                <Field
                    label="CNPJ"
                    value={formData.cnpj}
                    onChange={(val) => updateForm('cnpj', val)}
                    mask="00.000.000/0000-00"
                    required
                    placeholder="00.000.000/0000-00"
                />
                <Field
                    label="Razão Social"
                    value={formData.razao_social}
                    onChange={(val) => updateForm('razao_social', val)}
                    required
                    placeholder="Nome jurídico da empresa"
                />
                <Field
                    label="Nome Fantasia"
                    value={formData.nome_fantasia}
                    onChange={(val) => updateForm('nome_fantasia', val)}
                    required
                    placeholder="Nome comercial do consultor"
                />
            </FormSection>

            <FormSection title="Informações de Contato">
                <Field
                    label="Email Principal"
                    value={formData.email}
                    onChange={(val) => updateForm('email', val)}
                    required
                    type="email"
                    placeholder="consultor@email.com"
                />
                <Field
                    label="Celular / WhatsApp"
                    value={formData.celular}
                    onChange={(val) => updateForm('celular', val)}
                    mask="(00) 00000-0000"
                    required
                    placeholder="(00) 00000-0000"
                />
                <Field
                    label="Telefone Fixo"
                    value={formData.telefone_principal}
                    onChange={(val) => updateForm('telefone_principal', val)}
                    mask="(00) 0000-0000"
                    placeholder="(00) 0000-0000"
                />
            </FormSection>

            <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#00A3B1]/20 active:scale-95
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00A3B1] hover:bg-[#008c99]'}`}
                >
                    <CheckCircle size={20} />
                    {loading ? 'Salvando...' : 'Próxima Etapa'}
                </button>
            </div>
        </form>
    );
};

export default ConsultantGeneralForm;
