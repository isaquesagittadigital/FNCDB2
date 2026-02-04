
import React, { useState } from 'react';
import { FileText, Eye, Edit2, Download } from 'lucide-react';
import { Field } from '../../../shared/ui/FormElements';

interface ClientContractsProps {
    clientId?: string;
}

const ClientContractsTab: React.FC<ClientContractsProps> = ({ clientId }) => {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (clientId) {
            fetchContracts();
        }
    }, [clientId]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/contracts`);
            if (res.ok) {
                const data = await res.json();
                setContracts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    if (!clientId) {
        return <div className="p-8 text-center text-slate-500">Salve os dados gerais do cliente primeiro para visualizar contratos.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-sky-50 p-4 rounded-xl border border-sky-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-700">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#002B49] text-sm">Gestão de Contratos</h4>
                        <p className="text-xs text-sky-700">Gerencie os contratos e documentos do cliente</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Carregando contratos...</div>
                ) : contracts.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-slate-500 font-medium">Nenhum contrato gerado para este cliente.</p>
                    </div>
                ) : (
                    contracts.map((contract) => (
                        <div key={contract.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 rounded-lg text-[#002B49] group-hover:bg-[#E6F6F7] group-hover:text-[#00A3B1] transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#002B49]">{contract.titulo}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span>Data: {contract.data_assinatura ? new Date(contract.data_assinatura).toLocaleDateString() : 'Pendente'}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className={`font-bold ${contract.status === 'Assinado' ? 'text-emerald-600' : 'text-orange-500'
                                            }`}>{contract.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-[#00A3B1] hover:bg-[#E6F6F7] rounded-lg transition-colors" title="Visualizar">
                                    <Eye size={18} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-[#002B49] hover:bg-slate-100 rounded-lg transition-colors" title="Download">
                                    <Download size={18} />
                                </button>
                                {contract.status === 'Pendente' && (
                                    <button className="px-3 py-1.5 bg-[#00A3B1] text-white text-xs font-bold rounded-lg hover:bg-[#008c99] transition-colors shadow-sm ml-2">
                                        Assinar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientContractsTab;
