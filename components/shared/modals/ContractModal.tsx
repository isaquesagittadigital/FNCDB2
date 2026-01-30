
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronDown, ChevronUp, Plus, Upload, Download, CheckCircle2, MessageSquare, History, Paperclip, Calculator } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
  isValuesVisible?: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-8">
    <h3 className="text-sm font-bold text-[#002B49] tracking-widest uppercase">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; value: string; sensitive?: boolean; isVisible?: boolean }> = ({ label, value, sensitive, isVisible = true }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{label}:</p>
    <p className={`text-sm text-[#002B49] font-bold transition-all duration-300 ${sensitive && !isVisible ? 'blur-sm select-none opacity-80' : 'blur-0 opacity-100'}`}>
      {value || '-'}
    </p>
  </div>
);

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; icon: any }> = ({ title, children, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-t border-slate-100 last:border-b">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 group hover:px-2 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-[#E6F6F7] text-[#00A3B1]' : 'text-slate-300 group-hover:text-[#00A3B1]'}`}>
            <Icon size={20} />
          </div>
          <h3 className="text-sm font-bold text-[#002B49] tracking-wide uppercase">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="text-[#00A3B1]" size={20} /> : <ChevronDown className="text-slate-300 group-hover:text-[#00A3B1]" size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-8 px-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    'Vigente': 'bg-[#FFF0F6] text-[#D0021B] border-[#D0021B]/10',
    'Aguardando assinatura': 'bg-gray-100 text-gray-500 border-gray-200',
    'Aguardando comprovante': 'bg-orange-100 text-orange-600 border-orange-200',
    'Confirmação': 'bg-pink-100 text-pink-600 border-pink-200',
    'Processado': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
    'Não processado': 'bg-orange-50 text-orange-400 border-orange-100',
    'Sucesso': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
    'Ativo': 'bg-[#E6F6F7] text-[#00A3B1] border-[#00A3B1]/10',
    'Aprovado': 'bg-[#E6FBF1] text-[#27C27B] border border-[#27C27B]/10'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${styles[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
};

const ProcessCard: React.FC<{ title: string, description: string, status: string }> = ({ title, description, status }) => (
  <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-[#E6FBF1] rounded-full flex items-center justify-center transition-colors">
        <CheckCircle2 className="text-[#27C27B]" size={22} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#002B49]">{title}</h4>
        <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">{description}</p>
      </div>
    </div>
    <StatusBadge status={status} />
  </div>
);

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, contract, isValuesVisible = true }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#002B49]/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E6F6F7] rounded-2xl flex items-center justify-center shadow-sm">
                <FileText className="text-[#00A3B1]" size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#002B49]">Informações do contrato</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-300 hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
            
            {/* Top Summary Info */}
            <div className="bg-[#F8FAFB] rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
               <div className="grid grid-cols-4 border-b border-slate-100 bg-white/50">
                 {['Status', 'Contrato é unificado?', 'Cód. externo', 'Cód. contrato'].map(h => (
                   <div key={h} className="p-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{h}</div>
                 ))}
               </div>
               <div className="grid grid-cols-4 items-center">
                 <div className="p-4"><StatusBadge status="Vigente" /></div>
                 <div className="p-4 text-sm font-bold text-[#002B49]">Não</div>
                 <div className="p-4 text-sm font-bold text-[#002B49]">-</div>
                 <div className="p-4 text-sm font-bold text-[#002B49]">00000</div>
               </div>
            </div>

            {/* Main Sections */}
            <Section title="Contrato">
              <Field label="Produto" value="0001 - Câmbio" />
              <Field label="Descrição do produto" value="Uma descrição" />
              <Field label="Segmento" value="Câmbio" />
              <Field label="Tipo do rendimento" value="Mensal" />
              <Field label="Valor aportado" value="R$ 1.500,00" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Produto" value="Câmbio" />
              <Field label="Produto" value="-" />
              <Field label="Data do aporte" value="05/06/2025" />
              <Field label="Fim da vigência" value="10/08/2025" />
              <Field label="Período" value="12 meses" />
              <Field label="Rentabilidade % (a.m.)" value="2%" sensitive={true} isVisible={isValuesVisible} />
            </Section>

            <Section title="Cliente">
              <Field label="Nome" value="Carla Gandolfo" />
              <Field label="Telefone" value="(11) 00000-0000" />
              <Field label="Sexo" value="Feminino" />
              <div />
              <Field label="CPF" value="000.000.000-00" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Data de nascimento" value="00/00/0000" sensitive={true} isVisible={isValuesVisible} />
              <div /> <div />
              <Field label="Email" value="user@gmail.com" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Profissão" value="Empresária" />
            </Section>

            <Section title="Dados bancários - Cliente">
              <Field label="Banco" value="BANCO SANTANDER (BRASIL) S.A." />
              <Field label="Conta" value="00000000" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Agência" value="0000" sensitive={true} isVisible={isValuesVisible} />
              <div />
              <Field label="Tipo de conta" value="Conta corrente" />
              <Field label="Conta dígito" value="0" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Dígito agência" value="0" sensitive={true} isVisible={isValuesVisible} />
            </Section>

            <Section title="Consultor">
              <Field label="Nome" value="Carla Gandolfo Educação Financeira" />
              <Field label="Data de fundação" value="00/00/0000" />
              <Field label="Consultor atual do cliente" value="Carla Gandolfo Educação Financeira" />
              <div />
              <Field label="CNPJ" value="00.000.000/0001-00" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Razão Social" value="Carla Gandolfo Educação Financeira" />
              <div /> <div />
              <Field label="Email" value="user@gmail.com" sensitive={true} isVisible={isValuesVisible} />
              <Field label="Telefone" value="(11) 00000-0000" sensitive={true} isVisible={isValuesVisible} />
            </Section>

            <Section title="Unidade">
               <Field label="CNPJ" value="00.000.000/0001-00" />
               <Field label="Descrição da unidade" value="FNCD Capital" />
            </Section>

            {/* Status History Table */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#002B49] tracking-widest uppercase">Status</h3>
              <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFB] border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="p-4">Status ↕</th>
                      <th className="p-4">Usuário ↕</th>
                      <th className="p-4">Obs.</th>
                      <th className="p-4">Data inclusão ↕</th>
                      <th className="p-4">IP inclusão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { status: 'Aguardando assinatura', user: 'CARLA GANDOLFO...', obs: '-', date: '05/10/2025', ip: '000.000.000.000' },
                      { status: 'Aguardando comprovante', user: 'Usuário sistêmico', obs: '-', date: '05/10/2025', ip: '000.000.000.000' },
                      { status: 'Confirmação', user: 'CARLA GANDOLFO...', obs: '-', date: '05/10/2025', ip: '000.000.000.000' },
                      { status: 'Vigente', user: 'Alexandre da Silva', obs: '-', date: '05/10/2025', ip: '000.000.000.000' },
                    ].map((row, i) => (
                      <tr key={i} className="text-xs hover:bg-slate-50 transition-colors">
                        <td className="p-4"><StatusBadge status={row.status} /></td>
                        <td className="p-4 font-bold text-[#002B49]">{row.user}</td>
                        <td className="p-4 text-slate-400">{row.obs}</td>
                        <td className="p-4 text-slate-500 font-medium">{row.date}</td>
                        <td className="p-4 text-slate-400 font-medium transition-all duration-300" style={{ filter: !isValuesVisible ? 'blur(4px)' : 'none' }}>{row.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments & Anexos Accordion Style */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#002B49] tracking-widest uppercase">Comentários</h3>
                  <button className="flex items-center gap-2 text-[#00A3B1] font-bold text-xs hover:underline">
                    <MessageSquare size={14} /> Adicionar comentário
                  </button>
               </div>
               <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead className="bg-[#F8FAFB] border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase">
                        <tr>
                           <th className="p-4">Data de inclusão ↕</th>
                           <th className="p-4">Comentário</th>
                           <th className="p-4">Cliente</th>
                           <th className="p-4 text-right"></th>
                        </tr>
                     </thead>
                     <tbody className="text-xs">
                        <tr>
                           <td className="p-4 text-slate-400">-</td>
                           <td className="p-4 text-slate-400">-</td>
                           <td className="p-4 text-slate-400">-</td>
                           <td className="p-4 text-right flex items-center justify-end gap-3 font-bold uppercase tracking-wider">
                              <span className="text-slate-300 cursor-not-allowed">Apagar</span>
                              <span className="text-[#00A3B1] cursor-pointer hover:underline">Editar</span>
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#002B49] tracking-widest uppercase">Anexos</h3>
                  <button className="flex items-center gap-2 text-[#00A3B1] font-bold text-xs hover:underline">
                    <Plus size={14} /> Upload
                  </button>
               </div>
               <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                     <thead className="bg-[#F8FAFB] border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        <tr>
                           <th className="p-4">Data de inclusão ↕</th>
                           <th className="p-4">Tipo de documento ↕</th>
                           <th className="p-4">Tipo de transferência ↕</th>
                           <th className="p-4">Nome arq.</th>
                           <th className="p-4">Status</th>
                           <th className="p-4"></th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="hover:bg-slate-50 transition-colors">
                           <td className="p-4 text-slate-500">05/10/2025</td>
                           <td className="p-4 font-bold text-[#002B49]">Contrato</td>
                           <td className="p-4 text-slate-400">-</td>
                           <td className="p-4 text-slate-500">12345.pdf</td>
                           <td className="p-4"><StatusBadge status="Ativo" /></td>
                           <td className="p-4 text-right">
                              <button className="text-[#00A3B1] font-bold hover:underline inline-flex items-center gap-1">
                                 <Download size={14} /> Download
                              </button>
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Accordion List for Comissões and Dividendos */}
            <div className="space-y-2">
               <AccordionSection title="Comissões" icon={Calculator}>
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-[#F8FAFB] border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase">
                          <tr>
                             <th className="p-4">Consultor ↕</th>
                             <th className="p-4">Doc. consultor ↕</th>
                             <th className="p-4">Parcela</th>
                             <th className="p-4">Spread</th>
                             <th className="p-4">Data de vencimento ↕</th>
                             <th className="p-4">Valor comissão</th>
                             <th className="p-4">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {[
                             { name: 'CARLA GANDOLFO...', doc: '000.000.000-00', p: '1', s: '0', date: '10/08/2025', val: 'R$ 50,00', status: 'Sucesso' },
                             { name: 'CARLA GANDOLFO...', doc: '000.000.000-00', p: '2', s: '0', date: '10/08/2025', val: 'R$ 50,00', status: 'Não processada' },
                          ].map((row, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-[#002B49] uppercase">{row.name}</td>
                                <td className="p-4 text-slate-500" style={{ filter: !isValuesVisible ? 'blur(4px)' : 'none' }}>{row.doc}</td>
                                <td className="p-4 text-[#002B49] font-medium">{row.p}</td>
                                <td className="p-4 text-slate-500">{row.s}</td>
                                <td className="p-4 text-slate-500">{row.date}</td>
                                <td className="p-4 font-bold text-[#002B49]" style={{ filter: !isValuesVisible ? 'blur(4px)' : 'none' }}>{row.val}</td>
                                <td className="p-4"><StatusBadge status={row.status} /></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </AccordionSection>

               <AccordionSection title="Dividendos" icon={Calculator}>
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-[#F8FAFB] border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase">
                          <tr>
                             <th className="p-4">Parcela ↕</th>
                             <th className="p-4">Vencimento ↕</th>
                             <th className="p-4">Dias pro rata</th>
                             <th className="p-4">Valor div.</th>
                             <th className="p-4">Status</th>
                             <th className="p-4">Tipo</th>
                             <th className="p-4">Valor div. pago</th>
                             <th className="p-4">Data pgmto.</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {[
                             { p: '01', v: '10/08/2025', d: '-25', val: 'R$ 50,00', status: 'Processado', type: 'Dividendo', valP: 'R$ 50,00', pg: 'R$ 50,00' },
                             { p: '02', v: '10/08/2025', d: '0', val: 'R$ 50,00', status: 'Não processado', type: 'Dividendo', valP: 'R$ 50,00', pg: 'R$ 50,00' },
                          ].map((row, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-[#64748B]">{row.p}</td>
                                <td className="p-4 font-bold text-[#002B49]">{row.v}</td>
                                <td className="p-4 text-slate-400">{row.d}</td>
                                <td className="p-4 text-[#002B49] font-medium" style={{ filter: !isValuesVisible ? 'blur(4px)' : 'none' }}>{row.val}</td>
                                <td className="p-4"><StatusBadge status={row.status} /></td>
                                <td className="p-4 text-slate-500">{row.type}</td>
                                <td className="p-4 text-[#002B49] font-medium" style={{ filter: !isValuesVisible ? 'blur(4px)' : 'none' }}>{row.valP}</td>
                                <td className="p-4 text-[#002B49] font-bold" style={{ filter: !isValuesVisible ? 'blur(4px)' : 'none' }}>{row.pg}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </AccordionSection>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContractModal;
