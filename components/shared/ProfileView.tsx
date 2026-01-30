
import React, { useState } from 'react';
import { 
  Home, 
  User, 
  Upload, 
  Mail, 
  Calendar as CalendarIcon, 
  Search, 
  Eye, 
  EyeOff,
  CheckCircle2,
  HelpCircle,
  Building2,
  MapPin,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ProfileTab = 'access' | 'general' | 'address' | 'bank';

const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('access');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const tabs: { id: ProfileTab, label: string }[] = [
    { id: 'access', label: 'Dados de acesso' },
    { id: 'general', label: 'Dados gerais' },
    { id: 'address', label: 'Endereço' },
    { id: 'bank', label: 'Dados bancários' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'access': return <AccessDataTab showPassword={showPassword} setShowPassword={setShowPassword} />;
      case 'general': return <GeneralDataTab />;
      case 'address': return <AddressTab />;
      case 'bank': return <BankDataTab />;
      default: return null;
    }
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <span className="text-[#00A3B1] font-bold">Meus dados</span>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-xl font-bold text-[#002B49] mb-8">Meus dados</h2>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-[#002B49]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeProfileTab"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00A3B1]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-sm font-bold text-[#002B49] tracking-wide">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
      {children}
    </div>
  </div>
);

const Field: React.FC<{ 
  label: string, 
  value?: string, 
  type?: string, 
  placeholder?: string, 
  disabled?: boolean, 
  required?: boolean,
  icon?: any,
  rightIcon?: any,
  onRightIconClick?: () => void,
  className?: string
}> = ({ label, value, type = 'text', placeholder, disabled, required, icon: Icon, rightIcon: RightIcon, onRightIconClick, className }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="flex items-center gap-1 text-[11px] font-bold text-[#002B49] uppercase tracking-wider">
      {label}{required && <span className="text-[#00A3B1]">*</span>}
      {label.includes('Foto de perfil') && <HelpCircle size={14} className="text-slate-300 cursor-help" />}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00A3B1] transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        defaultValue={value}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all disabled:bg-slate-50 disabled:text-slate-400`}
      />
      {RightIcon && (
        <button 
          type="button" 
          onClick={onRightIconClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00A3B1] transition-colors"
        >
          <RightIcon size={18} />
        </button>
      )}
    </div>
  </div>
);

const AccessDataTab: React.FC<{ showPassword: any, setShowPassword: any }> = ({ showPassword, setShowPassword }) => (
  <div className="space-y-12">
    {/* Profile Photo Area */}
    <div className="flex flex-col md:flex-row items-start gap-10">
      <div className="flex-1 space-y-4 max-w-xs">
        <label className="flex items-center gap-1 text-[11px] font-bold text-[#002B49] uppercase tracking-wider">
          Foto de perfil<span className="text-[#00A3B1]">*</span>
          <HelpCircle size={14} className="text-slate-300 cursor-help" />
        </label>
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
          A foto deve ser apenas do rosto. Evite fotos de óculos escuro. Tire a foto em local bem iluminado.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
          <User className="text-slate-300" size={32} />
        </div>
        <div className="w-[400px] h-[100px] border-2 border-dashed border-[#E6F6F7] rounded-xl bg-[#F8FDFF] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#E6F6F7]/20 transition-all group">
          <div className="w-8 h-8 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-[#00A3B1]">
            <Upload size={16} />
          </div>
          <p className="text-xs font-bold">
            <span className="text-[#00A3B1]">Clique para carregar</span> ou arraste e solte
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PNG ou JPG (min. 800x400px)</p>
        </div>
      </div>
    </div>

    {/* General Fields */}
    <FormSection title="Dados de acesso">
      <Field label="ID Usuário" value="75LE2Z" disabled className="md:col-span-2" />
      <Field label="Nome de usuário" value="Isaque P Putumuju" required className="md:col-span-2" />
      <Field label="Email" value="isaquephputumuju@gmail.com" required className="md:col-span-2" />
      <div className="md:col-span-2 flex justify-end">
        <button className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all">
          <CheckCircle2 size={18} />
          Salvar informações
        </button>
      </div>
    </FormSection>

    {/* Password Section */}
    <FormSection title="Senha">
      <Field 
        label="Senha atual" 
        value="********" 
        type={showPassword.current ? 'text' : 'password'} 
        required 
        rightIcon={showPassword.current ? EyeOff : Eye}
        onRightIconClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
        className="md:col-span-2"
      />
      <Field 
        label="Nova senha" 
        value="********" 
        type={showPassword.new ? 'text' : 'password'} 
        required 
        rightIcon={showPassword.new ? EyeOff : Eye}
        onRightIconClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
        className="md:col-span-2"
      />
      <Field 
        label="Confirmar nova senha" 
        value="********" 
        type={showPassword.confirm ? 'text' : 'password'} 
        required 
        rightIcon={showPassword.confirm ? EyeOff : Eye}
        onRightIconClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
        className="md:col-span-2"
      />
      <div className="md:col-span-2 flex justify-end">
        <button className="flex items-center gap-2 bg-[#00A3B1]/20 text-[#00A3B1] px-8 py-3.5 rounded-xl font-bold text-sm opacity-50 cursor-not-allowed">
          <CheckCircle2 size={18} />
          Salvar senha
        </button>
      </div>
    </FormSection>
  </div>
);

const GeneralDataTab: React.FC = () => (
  <div className="space-y-12">
    <FormSection title="Informações da empresa">
      <Field label="Documento (CNPJ)" value="45.789.999/9999-99" required />
      <Field label="Data de fundação" value="12/04/2000" required rightIcon={CalendarIcon} />
      <Field label="Nome fantasia" value="Testes dev" required />
      <Field label="Razão social" value="Testes dev" required />
    </FormSection>

    <FormSection title="Informações de contato">
      <Field label="Email" value="isaquephputumuju@gmail.com" required icon={Mail} />
      <Field label="Email alternativo (opcional)" placeholder="Informe o email" icon={Mail} />
      <Field label="Celular" value="(77) 98811-3043" required />
      <Field label="Telefone principal (opcional)" placeholder="Informe o telefone" />
      <Field label="Telefone secundário (opcional)" placeholder="Informe o telefone secundário" className="md:col-span-2" />
      <Field label="CPF representante legal da empresa" value="047.253.905-18" required />
      <Field label="Nome do representante legal da empresa" value="Isaque testes da silva" required />
    </FormSection>

    <FooterNote />
  </div>
);

const AddressTab: React.FC = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
      <Field label="CEP" value="45712-000" required className="md:col-span-1" />
      <button className="flex items-center justify-center gap-2 h-[50px] bg-[#E6F6F7] text-[#00A3B1] px-6 rounded-xl font-bold text-sm hover:bg-[#B2E7EC] transition-all">
        <Search size={18} />
        Buscar CEP
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      <Field label="Endereço" value="Rua da Luz" required className="md:col-span-3" />
      <Field label="Número" value="12" required className="md:col-span-1" />
      <Field label="Complemento (opcional)" placeholder="Ex.: Apt. 10" className="md:col-span-2" />
      <Field label="Bairro" value="Rio do Meio" required className="md:col-span-6" />
      <Field label="Cidade" value="Itororó" required className="md:col-span-4" />
      <div className="space-y-2 md:col-span-2">
        <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider">UF<span className="text-[#00A3B1]">*</span></label>
        <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all">
          <option value="BA">BA</option>
          <option value="SP">SP</option>
          <option value="RJ">RJ</option>
        </select>
      </div>
    </div>

    <FooterNote />
  </div>
);

const BankDataTab: React.FC = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Documento (CNPJ)" value="45.712.000/0000-00" required />
      <Field label="Banco" value="159 - Casa do Crédito S.A. Sociedade de Crédito ao Microempreendedor" required />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
      <Field label="Agência" value="0000" required className="md:col-span-6" />
      <Field label="Dígito (agência)" value="0" required className="md:col-span-1" />
      <Field label="Conta" value="00000000" required className="md:col-span-2" />
      <Field label="Dígito (conta)" value="0" required className="md:col-span-1" />
    </div>

    <div className="w-full md:w-1/3">
      <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block mb-2">Tipo de conta<span className="text-[#00A3B1]">*</span></label>
      <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all">
        <option value="Corrente">Corrente</option>
        <option value="Poupança">Poupança</option>
      </select>
    </div>

    <FooterNote />
  </div>
);

const FooterNote = () => (
  <p className="text-[11px] text-[#00A3B1] font-bold italic">
    Para atualizar os dados, entre em contato com o administrador.
  </p>
);

export default ProfileView;
