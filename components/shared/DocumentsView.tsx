
import React, { useState } from 'react';
import { Home, Search, Eye, FileSearch, Download } from 'lucide-react';
import InvestorFormDocument from './documents/InvestorFormDocument';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className="bg-[#E6F6F7] text-[#00A3B1] text-[10px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
    {status}
  </span>
);

interface DocumentsViewProps {
  userProfile?: any;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ userProfile }) => {
  const [isInvestorFormOpen, setIsInvestorFormOpen] = useState(false);

  const documents = [
    { id: '23042849', status: 'Vigente', product: '0001 - Câmbio', amount: 'R$ 30.000,00', yield: '2,00%', period: '6 meses', startDate: '12/01/2026', endDate: '12/07/2026' },
    { id: '59308877', status: 'Vigente', product: '0001 - Câmbio', amount: 'R$ 51.000,00', yield: '1,50%', period: '12 meses', startDate: '21/12/2025', endDate: '21/12/2026' },
  ];

  const getInvestorProfileData = () => {
    // In a real scenario, fetch this from backend or use the userProfile
    // For now, mocking based on userProfile if available
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
      name: userProfile?.nome_fantasia || userProfile?.razao_social || userProfile?.nome || 'Nome do Cliente',
      document: userProfile?.cnpj || userProfile?.cpf || '000.000.000-00',
      nationality: 'Brasileira', // Mock or from profile
      maritalStatus: userProfile?.estado_civil || 'Solteiro(a)',
      profession: userProfile?.profissao || 'Não informado',
      birthDate: userProfile?.data_nascimento || '00/00/0000',
      rg: userProfile?.rg || '',
      address: userProfile?.endereco || 'Endereço não informado',
      city: userProfile?.cidade || 'Cidade',
      state: userProfile?.estado || 'UF',
      zipCode: userProfile?.cep || '00000-000',
      country: 'Brasil',
      email: userProfile?.email || 'email@exemplo.com',
      phone: userProfile?.telefone || '(00) 00000-0000',
      bankDetails: {
        bank: '001 - Banco do Brasil S.A.', // Mock
        agency: '0000-1',
        account: '0000-0',
        holder: userProfile?.nome || 'Titular',
        document: userProfile?.cpf || '000.000.000-00'
      },
      suitabilityProfile: userProfile?.perfil_investidor || 'Conservador',
      signatureDate: today
    };
  };

  const investorData = getInvestorProfileData();

  return (
    <div className="max-w-full space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Home size={14} className="text-[#00A3B1]" />
          <span className="opacity-50 font-bold">{'>'}</span>
          <span className="text-[#00A3B1] font-bold">Meus documentos</span>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00A3B1] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filtrar por tipo de documento"
            className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] w-64 transition-all"
          />
        </div>
      </div>

      <div className="space-y-12">
        {/* Meus documentos Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#002B49]">Meus documentos</h2>
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-[#F8FAFB] border-b border-slate-100">
                <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  {['Cód. contrato', 'Status', 'Produto', 'Aporte', 'Rentabilidade', 'Período', 'Data aporte', 'Fim do contrato'].map((h, i) => (
                    <th key={i} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {h}
                        <div className="flex flex-col opacity-30">
                          <span className="text-[8px] leading-[0.5]">▲</span>
                          <span className="text-[8px] leading-[0.5]">▼</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <button className="text-[#002B49] font-bold underline decoration-[#00A3B1]/30 hover:decoration-[#00A3B1] transition-all">
                        {doc.id}
                      </button>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={doc.status} /></td>
                    <td className="px-6 py-5 text-[#002B49] font-medium">{doc.product}</td>
                    <td className="px-6 py-5 text-[#002B49] font-bold">{doc.amount}</td>
                    <td className="px-6 py-5 text-[#002B49] font-medium">{doc.yield}</td>
                    <td className="px-6 py-5 text-[#002B49] font-medium">{doc.period}</td>
                    <td className="px-6 py-5 text-[#64748B]">{doc.startDate}</td>
                    <td className="px-6 py-5 text-[#64748B]">{doc.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulário do investidor */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#002B49]">Formulário do investidor</h3>
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 border-b border-slate-50 bg-[#F8FAFB]">
              <div className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Data de Assinatura</div>
              <div className="px-6 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-center">Perfil de investidor</div>
            </div>
            <div className="grid grid-cols-2 items-center px-6 py-6 group hover:bg-slate-50 transition-colors">
              <div className="text-sm text-slate-800 font-medium">{investorData.signatureDate}</div>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-center">
                  <span className="bg-[#E6F6F7] text-[#00A3B1] px-6 py-2 rounded-xl text-sm font-bold border border-[#00A3B1]/10">
                    {investorData.suitabilityProfile}
                  </span>
                </div>
                <button
                  onClick={() => setIsInvestorFormOpen(true)}
                  className="p-2 text-slate-300 hover:text-[#00A3B1] hover:bg-[#E6F6F7] rounded-lg transition-all"
                  title="Visualizar documento"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Assinaturas pendentes */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#002B49]">Assinaturas pendentes</h3>
          <div className="bg-white border border-slate-100 rounded-3xl py-24 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-[#E6F6F7] rounded-2xl flex items-center justify-center mb-6">
              <FileSearch className="text-[#00A3B1]" size={32} />
            </div>
            <h4 className="text-base font-bold text-[#002B49] mb-2">Nenhum documento foi localizado.</h4>
            <p className="text-sm text-slate-400 font-medium max-w-sm">
              Aguarde o envio dos documentos necessários para que sejam exibidos nesta seção.
            </p>
          </div>
        </div>
      </div>

      {/* Investor Form Modal */}
      {isInvestorFormOpen && (
        <InvestorFormDocument
          data={investorData}
          onClose={() => setIsInvestorFormOpen(false)}
        />
      )}

    </div>
  );
};

export default DocumentsView;
