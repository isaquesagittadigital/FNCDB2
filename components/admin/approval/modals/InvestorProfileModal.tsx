import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, Printer } from 'lucide-react';
import KYCDocumentContent from '../../../shared/KYCDocumentContent';

interface InvestorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
}

const InvestorProfileModal: React.FC<InvestorProfileModalProps> = ({ isOpen, onClose, clientId }) => {
    const [profile, setProfile] = useState<any>(null);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [onboardingData, setOnboardingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        if (isOpen && clientId) {
            setLoading(true);
            Promise.all([
                fetchProfile(),
                fetchBankAccounts(),
                fetchOnboarding()
            ]).finally(() => setLoading(false));
        }
    }, [isOpen, clientId]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/clients/${clientId}`);
            if (!res.ok) throw new Error('Falha ao buscar perfil');
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const fetchBankAccounts = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/clients/${clientId}/bank-accounts`);
            if (res.ok) {
                const data = await res.json();
                setBankAccounts(data || []);
            }
        } catch (err) {
            console.error('Error fetching bank accounts:', err);
        }
    };

    const fetchOnboarding = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/clients/${clientId}/onboarding`);
            if (res.ok) {
                const data = await res.json();
                setOnboardingData(data);
            }
        } catch (err) {
            console.error('Error fetching onboarding data:', err);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('kyc-document-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Formulário do Investidor - ${profile?.nome_fantasia || profile?.razao_social || 'KYC'}</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    body { font-family: 'Times New Roman', Times, serif; padding: 40px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    if (!isOpen) return null;

    // Merge all data exactly like DocumentsView.tsx does for the client flow:
    // 1. Start with usuarios data (profile)
    // 2. Map address fields (DB uses _end suffix, KYCDocumentContent expects without)
    // 3. Overlay onboarding KYC data (validation_token, ip_address, declarations_accepted_at, suitability, compliance)
    // 4. Parse JSON arrays if stored as strings
    // 5. Add bank data at top level
    const enrichedData = profile ? {
        ...profile,
        // Map address fields from the DB naming convention
        logradouro: profile.logradouro_end || profile.logradouro || profile.endereco,
        numero: profile.numero_end || profile.numero,
        complemento: profile.complemento_end || profile.complemento,
        // Merge onboarding KYC data (includes validation_token, ip_address, declarations_accepted_at)
        ...onboardingData,
        // Parse JSON arrays if stored as strings
        resource_origin: typeof onboardingData?.resource_origin === 'string'
            ? JSON.parse(onboardingData.resource_origin)
            : (onboardingData?.resource_origin || []),
        experience_areas: typeof onboardingData?.experience_areas === 'string'
            ? JSON.parse(onboardingData.experience_areas)
            : (onboardingData?.experience_areas || []),
        // Bank account data from the separate table
        ...(bankAccounts.length > 0 ? {
            banco: bankAccounts[0].banco,
            agencia: bankAccounts[0].agencia,
            conta: bankAccounts[0].conta,
        } : {}),
    } : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#002B49] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Formulário do Investidor (KYC)</h3>
                            <p className="text-xs text-white/60">
                                {profile?.nome_fantasia || profile?.razao_social || 'Carregando...'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {profile && (
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors text-sm font-medium"
                                title="Imprimir documento"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir
                            </button>
                        )}
                        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content - Full KYC Document */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 text-[#009ca6] animate-spin" />
                            <p className="text-sm text-slate-400">Carregando dados do investidor...</p>
                        </div>
                    ) : enrichedData ? (
                        <div id="kyc-document-content" className="px-8 py-6">
                            <KYCDocumentContent data={enrichedData} />
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nenhum dado encontrado para este cliente.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestorProfileModal;
