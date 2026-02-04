import React, { useState, useEffect } from 'react';
import { Field, FormSection } from '../../../shared/ui/FormElements';
import { Save, CheckCircle, Search } from 'lucide-react';

interface ClientAddressFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    wizardMode?: boolean;
}

const ClientAddressForm: React.FC<ClientAddressFormProps> = ({ initialData, onSubmit, loading, wizardMode = false }) => {
    const [formData, setFormData] = useState({
        cep: '',
        logradouro_end: '',
        numero_end: '',
        complemento_end: '',
        bairro: '',
        cidade: '',
        uf: ''
    });

    const [searchingCep, setSearchingCep] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const searchCep = async (cepInfo: string) => {
        const cleanCep = cepInfo.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setSearchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    logradouro_end: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf,
                    complemento_end: data.complemento || prev.complemento_end
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setSearchingCep(false);
        }
    };

    const updateForm = (key: string, val: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: val }));

        if (key === 'cep') {
            const clean = val.replace(/\D/g, '');
            if (clean.length === 8) {
                searchCep(clean);
            }
        }
    };



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (

        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider mb-4">Endereço</h3>
                </div>

                {/* Linha 1: CEP */}
                <div className="w-1/3 min-w-[200px]">
                    <Field
                        label="CEP"
                        value={formData.cep}
                        onChange={(val) => updateForm('cep', val)}
                        mask="00000-000"
                        required
                        placeholder="Insira o CEP"
                    />
                </div>

                {/* Linha 2 com Grid */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-4">
                        <Field
                            label="Endereço"
                            value={formData.logradouro_end}
                            onChange={(val) => updateForm('logradouro_end', val)}
                            required
                        />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                        <Field
                            label="Número"
                            value={formData.numero_end}
                            onChange={(val) => updateForm('numero_end', val)}
                            required
                            placeholder="Informe o número"
                        />
                    </div>
                    <div className="col-span-12 md:col-span-3">
                        <Field
                            label="Complemento (opcional)"
                            value={formData.complemento_end}
                            onChange={(val) => updateForm('complemento_end', val)}
                            placeholder="Ex.: Apt. 10"
                        />
                    </div>
                    <div className="col-span-12 md:col-span-3">
                        <Field
                            label="Bairro"
                            value={formData.bairro}
                            onChange={(val) => updateForm('bairro', val)}
                            required
                        />
                    </div>
                </div>

                {/* Linha 3: Cidade e UF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                        label="Cidade"
                        value={formData.cidade}
                        onChange={(val) => updateForm('cidade', val)}
                        required
                    />
                    <Field
                        label="UF"
                        value={formData.uf}
                        onChange={(val) => updateForm('uf', val)}
                        required
                        placeholder="UF"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-[#009BB6]/20 active:scale-95
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#009BB6] hover:bg-[#008f9e]'}`}
                >
                    {wizardMode ? <CheckCircle size={20} /> : <Save size={20} />}
                    {loading ? 'Processando...' : (wizardMode ? 'Continuar' : 'Salvar Endereço')}
                </button>
            </div>
        </form>
    );
};

export default ClientAddressForm;
