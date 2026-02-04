
import React, { useState } from 'react';
import {
  Home,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  FileText,
  Calendar as CalendarIcon,
  HelpCircle,
  Eye,
  CheckCircle2,
  X,
  MessageSquare,
  Mail,
  Send,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContractModal from '../shared/modals/ContractModal';

type ViewMode = 'list' | 'create';

interface ContractsViewProps {
  userProfile?: any;
}

const ContractsView: React.FC<ContractsViewProps> = ({ userProfile }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);


  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchContracts = async () => {
      // Fetch all for now, filter if needed. 
      // Ideally backend supports filtering.
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/contracts`);
        if (!response.ok) throw new Error('Falha ao buscar contratos');

        const data = await response.json();

        // Filter by consultant if user is consultant
        let filtered = data;
        if (userProfile?.id && userProfile?.tipo_user === 'Consultor') {
          filtered = data.filter((c: any) => c.consultor_id === userProfile.id);
        }

        const mapped = filtered.map((c: any) => ({
          id: c.id?.substring(0, 6) || '0000',
          extId: c.id_externo || '-',
          status: c.status || 'Pendente',
          product: c.titulo || 'Produto',
          amount: c.valor_aporte ? `R$ ${c.valor_aporte}` : '-',
          yield: c.taxa_mensal ? `${c.taxa_mensal}%` : '-',
          period: c.periodo_meses ? `${c.periodo_meses}` : '-',
          date: c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '-',
          end: '-' // Calculate end date if needed
        }));

        setContracts(mapped);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [userProfile]);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      'Confirmado': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
      'Vigente': 'bg-[#FFF0F6] text-[#D0021B] border-[#D0021B]/10',
      'Rejeitado': 'bg-[#FFF5F2] text-[#FF7A59] border-[#FF7A59]/10'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${styles[status] || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <button onClick={() => setViewMode('list')} className={`font-bold transition-colors ${viewMode === 'list' ? 'text-[#00A3B1]' : 'hover:text-[#00A3B1]'}`}>Contratos</button>
        {viewMode === 'create' && (
          <>
            <span className="opacity-50 font-bold">{'>'}</span>
            <span className="text-[#00A3B1] font-bold">Cadastrar contrato</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002B49]">{viewMode === 'list' ? 'Contratos' : 'Cadastrar contrato'}</h2>
        {viewMode === 'list' && (
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
          >
            <FileText size={18} />
            Cadastrar novo contrato
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
            {/* Filter Form */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Pesquisar cliente</h3>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#002B49] transition-colors">
                  <RotateCcw size={14} /> Limpar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Cliente</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 appearance-none">
                    <option>Selecione o cliente</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Consultor</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 appearance-none">
                    <option>Selecione o consultor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Produto</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 appearance-none">
                    <option>Selecione o produto</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Status do contrato</label>
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 appearance-none">
                    <option>Selecionar status</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">CPF/CNPJ</label>
                  <input type="text" placeholder="CPF ou CNPJ" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Código do contrato (externo)</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Código do contrato</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Aporte (início) <span className="text-[#00A3B1]">*</span></label>
                  <div className="relative">
                    <input type="text" placeholder="dd/mm/aaaa" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A3B1]" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Aporte (fim) <span className="text-[#00A3B1]">*</span></label>
                  <div className="relative">
                    <input type="text" placeholder="dd/mm/aaaa" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]" />
                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A3B1]" size={18} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {['Contrato novo', 'Contrato renovado', 'Contrato unificado', 'Contrato destino resgate'].map(label => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer h-5 w-5 appearance-none rounded border border-slate-300 checked:bg-[#00A3B1] checked:border-transparent transition-all" />
                      <CheckCircle2 className="absolute h-3.5 w-3.5 pointer-events-none hidden peer-checked:block text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-sm font-medium text-slate-500 group-hover:text-[#002B49]">{label}</span>
                  </label>
                ))}
                <div className="flex-1" />
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-[#002B49] px-8 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
                  <Search size={18} />
                  Pesquisar
                </button>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#002B49]">Contratos</h3>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-[#F8FAFB] border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="px-6 py-4">Cód. contrato ↕</th>
                      <th className="px-6 py-4">Cód. contr. (ext) ↕</th>
                      <th className="px-6 py-4">Status ↕</th>
                      <th className="px-6 py-4">Produto ↕</th>
                      <th className="px-6 py-4">Aporte ↕</th>
                      <th className="px-6 py-4">Rentabilidade % ↕</th>
                      <th className="px-6 py-4">Período ↕</th>
                      <th className="px-6 py-4">Data aporte ↕</th>
                      <th className="px-6 py-4">Fim do contrato ↕</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {contracts.map((c, i) => (
                      <tr key={i} className="text-sm hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5">
                          <button
                            onClick={() => setSelectedContract(c)}
                            className="text-[#002B49] font-bold underline decoration-[#00A3B1]/30 hover:decoration-[#00A3B1]"
                          >
                            {c.id}
                          </button>
                        </td>
                        <td className="px-6 py-5 text-slate-500">{c.extId}</td>
                        <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                        <td className="px-6 py-5 text-[#002B49] font-medium">{c.product}</td>
                        <td className="px-6 py-5 text-[#002B49] font-bold">{c.amount}</td>
                        <td className="px-6 py-5 text-slate-500">{c.yield}</td>
                        <td className="px-6 py-5 text-slate-500">{c.period}</td>
                        <td className="px-6 py-5 text-slate-400">{c.date}</td>
                        <td className="px-6 py-5 text-slate-400">{c.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm space-y-12"
          >
            {/* Preference Section */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-[#002B49] tracking-wide">Preferência de envio de link de assinatura</label>
              <div className="flex gap-4 p-1 bg-[#F8FAFB] w-fit rounded-xl border border-slate-100">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-lg text-sm font-bold text-[#27C27B] shadow-sm border border-slate-100">
                  <MessageSquare size={18} /> Whatsapp
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-[#002B49]">
                  <Mail size={18} /> Email
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-[#002B49]">
                  <Send size={18} /> SMS
                </button>
              </div>
            </div>

            {/* Client Select */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Informações do cliente</h3>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Cliente <span className="text-[#00A3B1]">*</span></label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]"
                >
                  <option value="">Selecione o cliente</option>
                  <option value="carla">Carla Gandolfo</option>
                </select>
              </div>

              {selectedClient === 'carla' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-8 border border-[#E6F6F7] rounded-3xl bg-white grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden"
                >
                  <div className="space-y-6">
                    <Field label="Nome" value="Carla Gandolfo" />
                    <Field label="CPF" value="000.000.000-00" />
                    <Field label="Celular" value="(11) 01234-5678" />
                    <Field label="Email" value="user@gmail.com" />
                  </div>
                  <div className="space-y-6">
                    <Field label="Tipo de conta" value="Corrente" />
                    <Field label="Cód. banco" value="000" />
                    <Field label="Agência" value="0000" />
                    <Field label="Agência dígito" value="0" />
                  </div>
                  <div className="space-y-6">
                    <Field label="Conta" value="00000000" />
                    <Field label="Conta dígito" value="0" />

                    <div className="mt-8 p-6 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl space-y-2">
                      <p className="text-[11px] font-bold text-[#92400E] uppercase tracking-wider">Atenção:</p>
                      <p className="text-[10px] text-[#B45309] font-medium leading-relaxed">Verifique se os dados do cliente estão atualizados.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Product Section */}
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Produto <span className="text-[#00A3B1]">*</span></label>
                <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium appearance-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1]">
                  <option>0001 - Câmbio</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Aporte <span className="text-[#00A3B1]">*</span></label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</div>
                    <input type="text" placeholder="1.500,00" className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Rentabilidade <span className="text-[#00A3B1]">*</span></label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-medium">% a.m.</div>
                    <input type="text" placeholder="1,6" className="w-full pl-16 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Período <span className="text-[#00A3B1]">*</span></label>
                  <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-bold appearance-none focus:ring-2 focus:ring-[#00A3B1]/10">
                    <option>12 meses</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider block">Data do aporte <span className="text-[#00A3B1]">*</span></label>
                <div className="relative w-full md:w-1/3">
                  <input type="text" placeholder="10/08/2025" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10" />
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A3B1]" size={18} />
                </div>
              </div>
            </div>

            {/* Summary Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Rendimento', val: 'Mensal', color: 'text-[#00A3B1]' },
                { label: 'Dia de pagamento', val: '10', color: 'text-[#00A3B1]' },
                { label: 'Segundo pagamento', val: '10', color: 'text-[#00A3B1]' },
                { label: 'Fim do contrato', val: '10/08/2025', color: 'text-[#00A3B1]' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-left space-y-1">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.val}</p>
                </div>
              ))}
            </div>

            {/* Installments Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFB] border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">Parcela</th>
                    <th className="px-6 py-4">Dias pro rata</th>
                    <th className="px-6 py-4">Valor do dividendo</th>
                    <th className="px-6 py-4">Data pagamento dividendo</th>
                    <th className="px-6 py-4">Tipo do dividendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { p: '01', dpr: '-10', val: 'R$ 1.000,00', date: '10/09/2025', type: 'Dividendo' },
                    { p: '02', dpr: '0', val: 'R$ 1.500,00', date: '10/10/2025', type: 'Dividendo' },
                    { p: '03', dpr: '0', val: 'R$ 1.500,00', date: '10/11/2025', type: 'Dividendo' },
                    { p: '04', dpr: '0', val: 'R$ 1.500,00', date: '10/12/2025', type: 'Dividendo' },
                  ].map((row, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-6 py-5 text-[#002B49] font-bold">{row.p}</td>
                      <td className="px-6 py-5 text-slate-500">{row.dpr}</td>
                      <td className="px-6 py-5 text-[#002B49] font-medium">{row.val}</td>
                      <td className="px-6 py-5 text-slate-400">{row.date}</td>
                      <td className="px-6 py-5 text-[#64748B]">{row.type}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#F8FAFB] font-bold text-sm">
                    <td colSpan={2} />
                    <td colSpan={3} className="px-6 py-5 text-[#002B49]">= R$ 14.500,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setViewMode('list')}
                className="px-10 py-4 text-slate-400 font-bold text-sm hover:text-[#002B49] transition-colors border border-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowSuccessModal(true)}
                className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-10 py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
              >
                <CheckCircle2 size={18} />
                Enviar contrato
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContractSuccessModal isOpen={showSuccessModal} onClose={() => {
        setShowSuccessModal(false);
        setViewMode('list');
      }} />

      {selectedContract && (
        <ContractModal
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
        />
      )}
    </div>
  );
};

const Field = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{label}:</p>
    <p className="text-sm font-bold text-[#002B49]">{value}</p>
  </div>
);

const ContractSuccessModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={20} /></button>
        <div className="w-20 h-20 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6F6F7]/50">
          <Send className="text-[#00A3B1]" size={36} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">Contrato enviado!</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">O contrato foi enviado com sucesso.</p>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98]">Fechar</button>
      </motion.div>
    </div>
  );
};

export default ContractsView;
