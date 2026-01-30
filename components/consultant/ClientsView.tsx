
import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  UserPlus, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  Trash2,
  Mail,
  Copy,
  Calendar as CalendarIcon,
  HelpCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'list' | 'create';
type ClientTab = 'general' | 'address' | 'bank' | 'contracts';

const ClientsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<ClientTab>('general');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBankEditAlert, setShowBankEditAlert] = useState(false);
  const [showGeneralEditAlert, setShowGeneralEditAlert] = useState(false);
  const [showSuccessDelete, setShowSuccessDelete] = useState(false);
  const [personType, setPersonType] = useState<'PF' | 'PJ'>('PF');

  const clients = [
    { name: 'Fernando da Silva', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Não apto', type: 'Física' },
    { name: 'Juliana Santana', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Apto', type: 'Física' },
    { name: 'Ricardo Nogueira', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Não apto', type: 'Física' },
    { name: 'Joana Martins', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Não apto', type: 'Física' },
    { name: 'Verônica Oliveira', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Apto', type: 'Física' },
    { name: 'Victor Luíz', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Apto', type: 'Jurídica' },
    { name: 'Rodolfo Marques', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Não apto', type: 'Física' },
    { name: 'Alessandra Campos', doc: '000.000.000-00', consult: 'Carla Gandolfo Educação Financeira LTDA', status: 'Apto', type: 'Física' },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const isApto = status === 'Apto';
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${isApto ? 'bg-[#E6FBF1] text-[#27C27B]' : 'bg-[#FFF5F2] text-[#FF7A59]'}`}>
        {status}
      </span>
    );
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const isFisica = type === 'Física';
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isFisica ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
        <span className="text-xs text-[#002B49] font-medium">{type}</span>
      </div>
    );
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <button onClick={() => setViewMode('list')} className={`font-bold transition-colors ${viewMode === 'list' ? 'text-[#00A3B1]' : 'hover:text-[#00A3B1]'}`}>Clientes</button>
        {viewMode === 'create' && (
          <>
            <span className="opacity-50 font-bold">{'>'}</span>
            <span className="text-[#00A3B1] font-bold">Cadastrar cliente</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002B49]">{viewMode === 'list' ? 'Clientes' : 'Cadastrar cliente'}</h2>
        {viewMode === 'list' && (
          <button 
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            Cadastrar novo cliente
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter Section */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-sm font-bold text-[#002B49] mb-6 uppercase tracking-wider">Pesquisar cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Consultor</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all appearance-none">
                    <option>Todos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nome do cliente</label>
                  <input type="text" placeholder="Digite o nome" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Documento</label>
                  <input type="text" placeholder="CPF ou CNPJ" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                </div>
                <button className="flex items-center justify-center gap-2 h-[46px] border border-slate-200 text-[#002B49] px-6 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                  <Search size={18} />
                  Pesquisar
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-[#F8FAFB] border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">Nome ↕</th>
                    <th className="px-6 py-4">Documento</th>
                    <th className="px-6 py-4">Consultor ↕</th>
                    <th className="px-6 py-4">Status ↕</th>
                    <th className="px-6 py-4">Tipo ↕</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clients.map((c, i) => (
                    <tr key={i} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 text-[#002B49] font-bold">{c.name}</td>
                      <td className="px-6 py-5 text-slate-500">{c.doc}</td>
                      <td className="px-6 py-5 text-slate-400">{c.consult}</td>
                      <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-5"><TypeBadge type={c.type} /></td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-[#00A3B1] rounded-lg transition-colors">
                          <CheckCircle2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#002B49] disabled:opacity-30">
                  <ChevronLeft size={16} /> Anterior
                </button>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, '...', 8, 9, 10].map((p, i) => (
                    <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-[#F8FAFB] text-[#002B49]' : 'text-slate-400 hover:text-[#002B49]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-[#002B49] hover:underline">
                  Próximo <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm"
          >
            {/* Form Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
              {['Dados gerais', 'Endereço', 'Dados bancários', 'Contratos'].map((tab) => {
                const id = tab.toLowerCase().split(' ')[0] as ClientTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(id)}
                    className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                      activeTab === id ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-[#002B49]'
                    }`}
                  >
                    {tab}
                    {activeTab === id && (
                      <motion.div 
                        layoutId="activeClientTab"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00A3B1]" 
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Content per Tab */}
            <div className="space-y-8">
              {activeTab === 'general' && (
                <GeneralTab 
                  personType={personType} 
                  setPersonType={setPersonType} 
                />
              )}
              {activeTab === 'address' && <AddressTab />}
              {activeTab === 'bank' && (
                <BankTab 
                  onEditAlert={() => setShowBankEditAlert(true)} 
                  onDelete={() => setIsDeleting(true)} 
                />
              )}
              {activeTab === 'contracts' && <ContractsTab />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <DeleteModal 
        isOpen={isDeleting} 
        onClose={() => setIsDeleting(false)} 
        onConfirm={() => {
          setIsDeleting(false);
          setShowSuccessDelete(true);
        }}
      />
      <DataAlertModal 
        isOpen={showBankEditAlert} 
        onClose={() => setShowBankEditAlert(false)} 
        title="Alterações nas informações bancárias"
        description="Para realizar quaisquer alterações de dados bancários, é necessário enviar nos um email solicitando com os dados atuais juntamente aos dados novos, incluindo algum comprovante de titularidade."
      />
      <DataAlertModal 
        isOpen={showGeneralEditAlert} 
        onClose={() => setShowGeneralEditAlert(false)} 
        title="Alterações de dados"
        description="Para alterar os dados, envie um email solicitando a alteração, por exemplo: 'Gostaria de alterar o meu nome de Carlos Araújo para Carlos Silva'."
      />
      <SuccessDeleteModal isOpen={showSuccessDelete} onClose={() => setShowSuccessDelete(false)} />
    </div>
  );
};

const Field = ({ label, placeholder, required, type = 'text', icon: Icon, error }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">
      {label}{required && <span className="text-[#00A3B1] ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />}
      <input 
        type={type} 
        placeholder={placeholder} 
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-white border rounded-xl text-sm text-[#002B49] font-medium focus:outline-none transition-all ${error ? 'border-red-400 ring-2 ring-red-50 ring-offset-0' : 'border-slate-200 focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]'}`}
      />
      {error && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />}
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
  </div>
);

const GeneralTab = ({ personType, setPersonType }: any) => {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Tipo de cliente</label>
        <div className="flex gap-2 p-1 bg-[#F8FAFB] w-fit rounded-xl border border-slate-100">
          <button 
            onClick={() => setPersonType('PF')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${personType === 'PF' ? 'bg-white text-[#002B49] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-[#002B49]'}`}
          >
            <Users size={18} /> Pessoa física
          </button>
          <button 
            onClick={() => setPersonType('PJ')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${personType === 'PJ' ? 'bg-white text-[#002B49] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-[#002B49]'}`}
          >
            <Building2 size={18} /> Pessoa jurídica
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Informações do cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label={personType === 'PF' ? 'Documento (CPF)' : 'Documento (CNPJ)'} placeholder={personType === 'PF' ? 'CPF' : 'CNPJ'} required />
          <Field label={personType === 'PF' ? 'Nome completo' : 'Razão social'} placeholder={personType === 'PF' ? 'Informe o nome completo' : 'Informe a razão social'} required />
          {personType === 'PF' && <Field label="Data de nascimento" placeholder="dd/mm/aaaa" required icon={CalendarIcon} />}
          {personType === 'PJ' && <Field label="Data de fundação" placeholder="dd/mm/aaaa" required icon={CalendarIcon} />}
          {personType === 'PF' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Sexo<span className="text-[#00A3B1] ml-1">*</span></label>
              <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
                <option>Selecione o sexo</option>
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </div>
          )}
          <Field label="Nacionalidade" placeholder="Informe a nacionalidade" required />
        </div>
      </div>

      {personType === 'PF' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="RG" placeholder="RG" required />
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">UF RG<span className="text-[#00A3B1] ml-1">*</span></label>
            <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
              <option>Selecione o estado</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Orgão RG<span className="text-[#00A3B1] ml-1">*</span></label>
            <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
              <option>Selecione o orgão emissor</option>
            </select>
          </div>
        </div>
      )}

      {personType === 'PF' && (
        <div className="space-y-8">
          <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Informações diversas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Estado civil<span className="text-[#00A3B1] ml-1">*</span></label>
              <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
                <option>Selecione o estado civil</option>
              </select>
            </div>
            <Field label="Profissão" placeholder="Informe a profissão" required />
          </div>
          
          <div className="p-6 bg-[#F8FAFB] border border-slate-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#002B49] uppercase">PPE</span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold text-[#00A3B1] shadow-sm">
                     <CheckCircle2 size={16} /> Sim
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50">
                     <X size={16} /> Não
                  </button>
                </div>
             </div>
             <div className="w-full md:flex-1 md:max-w-sm">
                <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block">Empresa<span className="text-[#00A3B1] ml-1">*</span></label>
                <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-[#002B49] font-medium">
                  <option>FNCD Capital</option>
                </select>
             </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Informações de contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Email" placeholder="Informe o email" required icon={Mail} />
          <Field label="Email alternativo" placeholder="Informe o email" icon={Mail} />
          <Field label="Celular" placeholder="Informe o celular" required />
          <Field label="Telefone principal" placeholder="(DDD)" />
          <Field label="Telefone secundário" placeholder="(DDD)" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all">
          <CheckCircle2 size={18} />
          Salvar informações
        </button>
      </div>
    </div>
  )
};

const AddressTab = () => (
  <div className="space-y-8">
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <Field label="CEP" placeholder="Informe o CEP" required className="md:col-span-1" />
        <button className="flex items-center justify-center gap-2 h-[50px] bg-[#00A3B1] text-white px-6 rounded-xl font-bold text-sm hover:bg-[#008c99] transition-all shadow-md">
          <Search size={18} />
          Buscar CEP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Field label="Endereço" placeholder="Informe o endereço" required className="md:col-span-2" />
        <Field label="Número" placeholder="Nº" required />
        <Field label="Complemento" placeholder="Ex.: Apt. 10" />
        <Field label="Bairro" placeholder="Informe o bairro" required className="md:col-span-4" />
        <Field label="Cidade" placeholder="Informe o endereço" required className="md:col-span-3" />
        <div className="space-y-2 md:col-span-1">
          <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">UF<span className="text-[#00A3B1] ml-1">*</span></label>
          <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
            <option>Selecione o estado</option>
          </select>
        </div>
      </div>
    </div>
    <div className="flex justify-end pt-4">
      <button className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all">
        <CheckCircle2 size={18} />
        Salvar endereço
      </button>
    </div>
  </div>
);

const BankTab = ({ onEditAlert, onDelete }: any) => {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-8">
      {!showForm ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={onEditAlert} 
              className="flex items-center gap-2 bg-[#F8FAFB] text-[#002B49] px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle size={16} /> Alterações
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#00A3B1] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#008c99] transition-all"
            >
              <Plus size={18} /> Cadastrar conta
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-[#F8FAFB] border-b border-slate-100">
                <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="px-6 py-4">Banco</th>
                  <th className="px-6 py-4">Agência</th>
                  <th className="px-6 py-4">Conta</th>
                  <th className="px-6 py-4">Titular</th>
                  <th className="px-6 py-4">Conta padrão</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[#002B49] font-bold">Banco Santander (Brasil) S.A.</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      0000-0 <Copy size={12} className="cursor-pointer text-slate-300 hover:text-[#00A3B1] transition-colors" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      00000000-0 <Copy size={12} className="cursor-pointer text-slate-300 hover:text-[#00A3B1] transition-colors" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      000.000.000-00 <Copy size={12} className="cursor-pointer text-slate-300 hover:text-[#00A3B1] transition-colors" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-[#E6F6F7] text-[#00A3B1] px-4 py-1.5 rounded-full text-[10px] font-bold border border-[#00A3B1]/10">
                      Padrão
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={onDelete} className="text-[#64748B] hover:text-red-500 transition-colors font-bold text-xs uppercase tracking-widest">
                       Deletar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[#00A3B1] font-bold italic">
            Para atualizar os dados, entre em contato com o administrador.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Dados bancários</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Documento (CPF)" placeholder="000.000.000-00" required />
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Banco<span className="text-[#00A3B1] ml-1">*</span></label>
                <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
                  <option>Selecione o banco</option>
                </select>
              </div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Field label="Agência" required />
              <Field label="Dígito (agência)" />
              <Field label="Conta" required />
              <Field label="Dígito (conta)" />
           </div>
           <div className="w-full md:w-1/2 space-y-2">
              <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Tipo de conta<span className="text-[#00A3B1] ml-1">*</span></label>
              <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none">
                <option>Selecione o tipo de conta</option>
              </select>
           </div>
           <div className="flex justify-end gap-4">
              <button onClick={() => setShowForm(false)} className="px-8 py-3.5 text-slate-400 font-bold text-sm hover:text-[#002B49]">Cancelar</button>
              <button className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all">
                <CheckCircle2 size={18} />
                Salvar dados bancários
              </button>
           </div>
        </div>
      )}
    </div>
  )
};

const ContractsTab = () => (
  <div className="space-y-6">
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-left min-w-[800px]">
        <thead className="bg-[#F8FAFB] border-b border-slate-100">
          <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            <th className="px-6 py-4">Título do documento ↕</th>
            <th className="px-6 py-4">Data assinatura ↕</th>
            <th className="px-6 py-4">Status ↕</th>
            <th className="px-6 py-4">Ação</th>
            <th className="px-6 py-4 text-right"></th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: '0000', date: '02/09/2024', status: 'Assinado' },
            { id: '0000', date: '-', status: 'Pendente' },
            { id: '0000', date: '-', status: 'Pendente' },
            { id: '0000', date: '-', status: 'Pendente' },
          ].map((row, i) => (
            <tr key={i} className="text-sm hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-5 text-[#002B49] font-bold underline decoration-[#00A3B1]/30 hover:decoration-[#00A3B1] transition-all cursor-pointer">
                {row.id}
              </td>
              <td className="px-6 py-5 text-slate-500">{row.date}</td>
              <td className="px-6 py-5">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${row.status === 'Assinado' ? 'bg-[#E6F6F7] text-[#00A3B1] border-[#00A3B1]/10' : 'bg-[#FFF5F2] text-[#FF7A59] border-[#FF7A59]/10'}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-5">
                <button className={`text-[#00A3B1] font-bold text-xs hover:underline uppercase tracking-wider ${row.status === 'Assinado' ? 'opacity-30 cursor-default no-underline' : ''}`}>
                  Assinar
                </button>
              </td>
              <td className="px-6 py-5 text-right">
                <button className="p-2 text-slate-300 hover:text-[#00A3B1] transition-colors">
                   <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Footer */}
      <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-[#F8FAFB]/30">
        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#002B49] disabled:opacity-30">
          <ChevronLeft size={16} /> Anterior
        </button>
        <div className="flex items-center gap-2">
          {[1, 2, 3, '...', 8, 9, 10].map((p, i) => (
            <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-white text-[#00A3B1] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-[#002B49]'}`}>
              {p}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-[#00A3B1] hover:underline">
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </div>
);

// High Fidelity Modals
const DeleteModal = ({ isOpen, onClose, onConfirm }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500"><X size={20} /></button>
        <div className="w-20 h-20 bg-[#FFF5F2] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#FFF5F2]/50">
          <Trash2 className="text-[#FF7A59]" size={32} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">Exclusão de conta bancária</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed px-4">Tem certeza que deseja excluir a conta bancária?</p>
        </div>
        <div className="space-y-3">
          <button onClick={onConfirm} className="w-full py-4 bg-[#D93025] hover:bg-[#B7231A] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]">Sim, excluir</button>
          <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Não, cancelar</button>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessDeleteModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={20} /></button>
        <div className="w-20 h-20 bg-[#E6FBF1] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6FBF1]/50">
          <CheckCircle2 className="text-[#27C27B]" size={36} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">Conta excluída</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">A conta foi excluída com sucesso.</p>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98]">Fechar</button>
      </motion.div>
    </div>
  );
};

const DataAlertModal = ({ isOpen, onClose, title, description }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500"><X size={20} /></button>
        <div className="w-20 h-20 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6F6F7]/50">
          <Mail className="text-[#00A3B1]" size={32} />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#002B49] leading-tight px-2">{title}</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className="space-y-3">
          <button className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            Enviar email <ExternalLink size={14} />
          </button>
          <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientsView;
