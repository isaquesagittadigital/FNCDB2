
import React, { useState, useEffect } from 'react';
import { Save, Search } from 'lucide-react';

interface ClientAddressFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
}

const ClientAddressForm: React.FC<ClientAddressFormProps> = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                cep: initialData.cep || '',
                logradouro: initialData.logradouro || '',
                numero: initialData.numero || '',
                complemento: initialData.complemento || '',
                bairro: initialData.bairro || '',
                cidade: initialData.cidade || '',
                uf: initialData.uf || ''
            }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleSearchCep = () => {
        // Mock implementation or use external API
        if (formData.cep.length >= 8) {
            // Simulate API call
            console.log("Searching CEP:", formData.cep);
            // In a real app we would fetch here
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Endereço</h3>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2 lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-500">CEP <span className="text-red-500">*</span></label>
                        <input
                            name="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            placeholder="00000-000"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <button
                            type="button"
                            onClick={handleSearchCep}
                            className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Search size={18} />
                            Buscar CEP
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Endereço <span className="text-red-500">*</span></label>
                        <input
                            name="logradouro"
                            value={formData.logradouro}
                            onChange={handleChange}
                            placeholder="Rua, Avenida, etc."
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Número <span className="text-red-500">*</span></label>
                            <input
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                placeholder="123"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Complemento</label>
                            <input
                                name="complemento"
                                value={formData.complemento}
                                onChange={handleChange}
                                placeholder="Apto 101"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Bairro <span className="text-red-500">*</span></label>
                        <input
                            name="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            placeholder="Bairro"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Cidade <span className="text-red-500">*</span></label>
                        <input
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            placeholder="Cidade"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">UF <span className="text-red-500">*</span></label>
                        <select
                            name="uf"
                            value={formData.uf}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1]"
                        >
                            <option value="">Selecione</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            <option value="MG">MG</option>
                            {/* Add others */}
                        </select>
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
                    {loading ? 'Salvando...' : 'Salvar endereço'}
                </button>
            </div>
        </form>
    );
};

export default ClientAddressForm;
