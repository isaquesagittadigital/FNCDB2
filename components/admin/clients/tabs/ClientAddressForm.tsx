import React, { useState, useEffect } from 'react';
import { Save, MapPin, Search, CheckCircle, ChevronRight } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface ClientAddressFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    wizardMode?: boolean;
}

const ClientAddressForm: React.FC<ClientAddressFormProps> = ({ initialData, onSubmit, loading, wizardMode = false }) => {
    const [formData, setFormData] = useState({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaskChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchCep = async () => {
        const cleanCep = formData.cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setSearchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf
                }));
            } else {
                alert('CEP não encontrado!');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP. Tente novamente.');
        } finally {
            setSearchingCep(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-[#E6F6F7] rounded-lg">
                        <MapPin className="text-[#00A3B1]" size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Endereço</h3>
                        <p className="text-xs text-slate-500">Localização do cliente</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">CEP <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <IMaskInput
                                mask="00000-000"
                                value={formData.cep}
                                onAccept={(value) => handleMaskChange('cep', value)}
                                placeholder="00000-000"
                                className="w-full pl-4 pr-12 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                                onBlur={() => {
                                    if (formData.cep.replace(/\D/g, '').length === 8) handleSearchCep();
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSearchCep}
                                disabled={searchingCep}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#00A3B1] hover:bg-[#E6F6F7] rounded transition-colors"
                            >
                                {searchingCep ? <div className="animate-spin h-4 w-4 border-2 border-[#00A3B1] border-t-transparent rounded-full" /> : <Search size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-3">
                        <label className="text-xs font-semibold text-slate-500">Logradouro <span className="text-red-500">*</span></label>
                        <input
                            name="logradouro"
                            value={formData.logradouro}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Número <span className="text-red-500">*</span></label>
                        <input
                            name="numero"
                            value={formData.numero}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Complemento</label>
                        <input
                            name="complemento"
                            value={formData.complemento}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Bairro <span className="text-red-500">*</span></label>
                        <input
                            name="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Cidade <span className="text-red-500">*</span></label>
                        <input
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">UF <span className="text-red-500">*</span></label>
                        <input
                            name="uf"
                            value={formData.uf}
                            onChange={handleChange}
                            maxLength={2}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] bg-slate-50 uppercase"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : (wizardMode ? 'bg-[#00A3B1] hover:bg-[#008c99]' : 'bg-[#002B49] hover:bg-[#00385D]')}`}
                >
                    {wizardMode ? <CheckCircle size={18} /> : <Save size={18} />}
                    {loading ? 'Processando...' : (wizardMode ? 'Continuar' : 'Salvar endereço')}
                </button>
            </div>
        </form>
    );
};

export default ClientAddressForm;
