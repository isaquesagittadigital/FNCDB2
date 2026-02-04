import React, { useState, useEffect } from 'react';
import { Field, SelectField } from '../../../shared/ui/FormElements';
import { CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';

interface ConsultantCommissionFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
}

const ConsultantCommissionForm: React.FC<ConsultantCommissionFormProps> = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        meta_carteira: '',
        percentual_trabalho: '',
        nivel_colaborador: 'Consultor',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                meta_carteira: initialData.meta_carteira || '',
                percentual_trabalho: initialData.percentual_trabalho || '',
                nivel_colaborador: initialData.nivel_colaborador || 'Consultor'
            }));
        }
    }, [initialData]);

    const updateForm = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-[#00A3B1]" />
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Comissionamento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field
                    label="Meta de Carteira"
                    value={formData.meta_carteira}
                    onChange={(val) => updateForm('meta_carteira', val)}
                    required
                    placeholder="10.000,00"
                />
                <Field
                    label="Percentual de trabalho"
                    value={formData.percentual_trabalho}
                    onChange={(val) => updateForm('percentual_trabalho', val)}
                    required
                    placeholder="2,00"
                />
                <SelectField
                    label="Nível do colaborador"
                    value={formData.nivel_colaborador}
                    onChange={(val) => updateForm('nivel_colaborador', val)}
                    required
                    options={[
                        { value: 'Consultor', label: 'Consultor' },
                        { value: 'Lider', label: 'Lider' },
                        { value: 'Master', label: 'Master' },
                    ]}
                />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all hover:bg-slate-50 active:scale-95"
                >
                    <RotateCcw size={20} />
                    Voltar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#00A3B1]/20 active:scale-95
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00A3B1] hover:bg-[#008c99]'}`}
                >
                    <CheckCircle size={20} />
                    {loading ? 'Salvando...' : 'Salvar dados'}
                </button>
            </div>
        </form>
    );
};

export default ConsultantCommissionForm;
