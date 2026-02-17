import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, CreditCard, Calendar, Shield } from 'lucide-react';

interface InvestorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
}

const InvestorProfileModal: React.FC<InvestorProfileModalProps> = ({ isOpen, onClose, clientId }) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

    useEffect(() => {
        if (isOpen && clientId) {
            fetchProfile();
        }
    }, [isOpen, clientId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/clients/${clientId}`);
            if (!res.ok) throw new Error('Falha ao buscar perfil');
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
            {Icon && <Icon className="w-4 h-4 text-[#009ca6] mt-0.5 flex-shrink-0" />}
            <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-sm text-slate-800 font-medium mt-0.5">{value || '—'}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#002B49] to-[#003d66]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Perfil do Investidor</h3>
                            <p className="text-sm text-white/70">Dados cadastrais do onboarding</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[65vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-[#009ca6] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h4 className="text-sm font-semibold text-[#002B49] mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Dados Pessoais
                                </h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                                    <InfoRow label="Nome" value={profile.nome_fantasia || profile.nome_completo} icon={User} />
                                    <InfoRow label="CPF" value={profile.cpf} icon={CreditCard} />
                                    <InfoRow label="RG" value={profile.rg ? `${profile.rg} - ${profile.orgao_emissor || ''} ${profile.uf_rg || ''}` : undefined} />
                                    <InfoRow label="Data de Nascimento" value={profile.data_nascimento ? new Date(profile.data_nascimento).toLocaleDateString('pt-BR') : undefined} icon={Calendar} />
                                    <InfoRow label="Sexo" value={profile.sexo} />
                                    <InfoRow label="Nacionalidade" value={profile.nacionalidade} />
                                    <InfoRow label="Estado Civil" value={profile.estado_civil} />
                                    <InfoRow label="Profissão" value={profile.profissao} />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="text-sm font-semibold text-[#002B49] mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Contato
                                </h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                                    <InfoRow label="Email" value={profile.email} icon={Mail} />
                                    <InfoRow label="Celular" value={profile.celular} icon={Phone} />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h4 className="text-sm font-semibold text-[#002B49] mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Endereço
                                </h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                                    <InfoRow label="CEP" value={profile.cep} icon={MapPin} />
                                    <InfoRow label="Endereço" value={profile.endereco ? `${profile.endereco}, ${profile.numero || 'S/N'} ${profile.complemento || ''}` : undefined} />
                                    <InfoRow label="Bairro" value={profile.bairro} />
                                    <InfoRow label="Cidade/UF" value={profile.cidade ? `${profile.cidade} - ${profile.estado}` : undefined} />
                                </div>
                            </div>

                            {/* Banking Info */}
                            <div>
                                <h4 className="text-sm font-semibold text-[#002B49] mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> Dados Bancários
                                </h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                                    <InfoRow label="Banco" value={profile.banco} icon={CreditCard} />
                                    <InfoRow label="Agência" value={profile.agencia} />
                                    <InfoRow label="Conta" value={profile.conta} />
                                    <InfoRow label="Tipo de Conta" value={profile.tipo_conta} />
                                    <InfoRow label="Chave PIX" value={profile.chave_pix} />
                                </div>
                            </div>

                            {/* KYC / Compliance */}
                            <div>
                                <h4 className="text-sm font-semibold text-[#002B49] mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Compliance
                                </h4>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                                    <InfoRow label="PEP" value={profile.pep === true ? 'Sim' : profile.pep === false ? 'Não' : '—'} icon={Shield} />
                                    <InfoRow label="US Person" value={profile.us_person === true ? 'Sim' : profile.us_person === false ? 'Não' : '—'} />
                                    <InfoRow label="Suitability" value={profile.perfil_investidor || profile.suitability} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            Nenhum dado encontrado para este cliente.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestorProfileModal;
