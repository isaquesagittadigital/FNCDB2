
import React, { useState, useEffect } from 'react';
import { Save, Building2, User, ChevronRight, CheckCircle } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface ConsultantGeneralFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
}

const ConsultantGeneralForm: React.FC<ConsultantGeneralFormProps> = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        tipo_user: 'Consultor',
        nome_fantasia: '', // Used as Name
        email: '',
        documento: '', // CPF/CNPJ stored here or in specific fields? 
        // Based on ConsultantsView mockup: Name, Email, Document, Clients, Status
        // We will repurpose existing fields:
        // nome_fantasia -> Name
        // email -> Email
        // cpf or cnpj -> Document
        cpf: '',
        cnpj: '',
        celular: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaskChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome_fantasia || !formData.email) {
            alert('Nome e Email são obrigatórios!');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Dados do Consultor</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Nome Completo / Razão Social <span className="text-red-500">*</span></label>
                        <input
                            name="nome_fantasia"
                            value={formData.nome_fantasia}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            placeholder="Nome do consultor"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Email <span className="text-red-500">*</span></label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">CPF</label>
                        <IMaskInput
                            mask="000.000.000-00"
                            value={formData.cpf}
                            onAccept={(value) => handleMaskChange('cpf', value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">CNPJ (Opcional)</label>
                        <IMaskInput
                            mask="00.000.000/0000-00"
                            value={formData.cnpj}
                            onAccept={(value) => handleMaskChange('cnpj', value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            placeholder="00.000.000/0000-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Celular</label>
                        <IMaskInput
                            mask="(00) 00000-0000"
                            value={formData.celular}
                            onAccept={(value) => handleMaskChange('celular', value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            placeholder="(00) 00000-0000"
                        />
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
                    {loading ? 'Processando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

export default ConsultantGeneralForm;
