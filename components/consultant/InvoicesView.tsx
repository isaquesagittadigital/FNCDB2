
import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Plus, 
  FileText, 
  Eye, 
  Trash2, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  ChevronLeft,
  ChevronRight,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Invoice {
  id: number;
  lote: string;
  valor: string;
  arquivo: string;
  dataEnvio: string;
  status: 'Aprovada' | 'Rejeitada' | 'Pendente';
  motivoRejeicao?: string;
}

const InvoicesView: React.FC = () => {
  const [view, setView] = useState<'list' | 'empty'>('list');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [showSuccessSent, setShowSuccessSent] = useState(false);
  const [showSuccessDeleted, setShowSuccessDeleted] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 1, lote: 'Comissão 30.05.2025', valor: 'R$ 1.500,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Rejeitada', motivoRejeicao: 'Motivo da rejeição...' },
    { id: 2, lote: 'Comissão 30.05.2025', valor: 'R$ 2.400,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Aprovada' },
    { id: 3, lote: 'Comissão 30.05.2025', valor: 'R$ 3.600,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Aprovada' },
    { id: 4, lote: 'Comissão 30.05.2025', valor: 'R$ 1.600,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Rejeitada' },
    { id: 5, lote: 'Comissão 30.05.2025', valor: 'R$ 2.750,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Rejeitada' },
    { id: 6, lote: 'Comissão 30.05.2025', valor: 'R$ 2.200,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Aprovada' },
    { id: 7, lote: 'Comissão 30.05.2025', valor: 'R$ 2.400,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Aprovada' },
    { id: 8, lote: 'Comissão 30.05.2025', valor: 'R$ 2.560,00', arquivo: 'nota_fiscal.pdf', dataEnvio: '24/05/2025 01:01:42', status: 'Aprovada' },
  ]);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      'Aprovada': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
      'Rejeitada': 'bg-[#FFF5F2] text-[#FF7A59] border-[#FF7A59]/10',
      'Pendente': 'bg-slate-50 text-slate-400 border-slate-200'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const handleDelete = () => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete?.id));
    setInvoiceToDelete(null);
    setShowSuccessDeleted(true);
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <span className="text-[#00A3B1] font-bold">Nota fiscal</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#002B49]">Nota fiscal de comissão</h2>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00A3B1] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CPF ou CNPJ"
              className="pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] w-80 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
          >
            <FileText size={18} />
            Enviar nota fiscal
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {invoices.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl py-32 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-[#B2E7EC]/30 rounded-2xl flex items-center justify-center mb-6">
              <FileSearch className="text-[#00A3B1]" size={32} />
            </div>
            <h4 className="text-base font-bold text-[#002B49] mb-2">Nenhuma nota encontrada.</h4>
            <p className="text-sm text-slate-400 font-medium max-w-sm">
              Cadastre notas fiscais em sua conta para vê-las aqui
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Histórico de notas fiscais</h3>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-[#F8FAFB] border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">Lote ↕</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Arquivo ↕</th>
                    <th className="px-6 py-4">Data de envio ↕</th>
                    <th className="px-6 py-4">Status ↕</th>
                    <th className="px-6 py-4">Motivo rejeição ↕</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 text-[#002B49] font-medium">{inv.lote}</td>
                      <td className="px-6 py-5 text-[#002B49] font-bold">{inv.valor}</td>
                      <td className="px-6 py-5 text-[#00A3B1] font-medium hover:underline cursor-pointer">{inv.arquivo}</td>
                      <td className="px-6 py-5 text-slate-400">{inv.dataEnvio}</td>
                      <td className="px-6 py-5"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-5 text-slate-400 max-w-[200px] truncate">{inv.motivoRejeicao || '-'}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setInvoiceToDelete(inv)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-2 text-slate-300 hover:text-[#00A3B1] transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <UploadInvoiceModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={() => {
          setIsUploadModalOpen(false);
          setShowSuccessSent(true);
        }}
      />
      <ViewInvoiceModal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        invoice={selectedInvoice} 
      />
      <DeleteConfirmationModal 
        isOpen={!!invoiceToDelete} 
        onClose={() => setInvoiceToDelete(null)} 
        onConfirm={handleDelete}
      />
      <SuccessModal 
        isOpen={showSuccessSent} 
        onClose={() => setShowSuccessSent(false)} 
        title="Nota enviada" 
        description="A nota fiscal foi enviada com sucesso. Acompanhe o status na tela de nota fiscal de comissão."
        icon={Send}
      />
      <SuccessModal 
        isOpen={showSuccessDeleted} 
        onClose={() => setShowSuccessDeleted(false)} 
        title="Nota excluída" 
        description="A nota fiscal foi excluída com sucesso."
        icon={CheckCircle2}
      />
    </div>
  );
};

// --- Sub-Components ---

const UploadInvoiceModal = ({ isOpen, onClose, onSuccess }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        <div className="w-14 h-14 bg-[#B2E7EC]/40 rounded-2xl flex items-center justify-center">
          <FileText className="text-[#00A3B1]" size={28} />
        </div>
        <h3 className="text-xl font-bold text-[#002B49]">Cadastrar nota fiscal</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Título da nota <span className="text-[#00A3B1]">*</span></label>
            <input type="text" placeholder="Ex.: Comissão 20/05/2025" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Valor da nota <span className="text-[#00A3B1]">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input type="text" placeholder="0,00" className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] outline-none transition-all" />
            </div>
          </div>
          
          <div className="w-full h-32 border-2 border-dashed border-slate-100 rounded-[2rem] bg-[#F8FAFB] flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-slate-50 transition-all">
             <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 group-hover:text-[#00A3B1] transition-colors">
               <Upload size={20} />
             </div>
             <p className="text-xs font-medium text-slate-400">
               <span className="text-slate-900 font-bold">Clique para carregar</span> ou arraste e solte
             </p>
             <p className="text-[10px] text-slate-300 font-bold uppercase">PDF (max. 2mb)</p>
          </div>

          <div className="p-4 border border-slate-100 rounded-2xl space-y-3">
             <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                      <FileText size={20} />
                   </div>
                   <div className="space-y-1">
                      <p className="font-bold text-[#002B49]">nota_fiscal.pdf</p>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                         200 KB of 200 KB <span className="text-[#27C27B] flex items-center gap-1 font-bold"><CheckCircle2 size={12} /> Completo</span>
                      </div>
                   </div>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
             </div>
             <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-[#00A3B1] rounded-full" />
             </div>
             <div className="text-right text-[10px] font-bold text-slate-400">100%</div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={onSuccess} className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98]">Enviar nota fiscal</button>
          <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
};

const ViewInvoiceModal = ({ isOpen, onClose, invoice }: any) => {
  if (!isOpen || !invoice) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 bg-[#B2E7EC]/40 rounded-2xl flex items-center justify-center">
            <FileText className="text-[#00A3B1]" size={28} />
          </div>
          {invoice.status === 'Rejeitada' && (
            <span className="px-4 py-1 bg-[#FFF5F2] text-[#FF7A59] border border-[#FF7A59]/10 rounded-full text-[10px] font-bold">Rejeitada</span>
          )}
        </div>
        <h3 className="text-xl font-bold text-[#002B49]">Ver nota fiscal</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Título da nota <span className="text-[#00A3B1]">*</span></label>
            <input type="text" value={invoice.lote} readOnly className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#002B49] outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Valor da nota <span className="text-[#00A3B1]">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input type="text" value={invoice.valor.replace('R$ ', '')} readOnly className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#002B49] outline-none" />
            </div>
          </div>
          
          <div className="w-full h-32 border border-slate-100 rounded-[2rem] bg-[#F8FAFB] flex flex-col items-center justify-center gap-2 cursor-not-allowed">
             <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-300">
               <Upload size={20} />
             </div>
             <p className="text-xs font-medium text-slate-300">
               Clique para carregar ou arraste e solte
             </p>
             <p className="text-[10px] text-slate-200 font-bold uppercase">PDF (max. 2mb)</p>
          </div>

          <div className="p-4 border border-slate-100 rounded-2xl space-y-3">
             <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                      <FileText size={20} />
                   </div>
                   <div className="space-y-1">
                      <p className="font-bold text-[#002B49]">{invoice.arquivo}</p>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                         200 KB of 200 KB <span className="text-[#27C27B] flex items-center gap-1 font-bold"><CheckCircle2 size={12} /> Completo</span>
                      </div>
                   </div>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
             </div>
             <div className="w-full h-2 bg-[#00A3B1] rounded-full" />
             <div className="text-right text-[10px] font-bold text-slate-400">100%</div>
          </div>

          {invoice.status === 'Rejeitada' && (
            <div className="flex items-start gap-3 text-red-500">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">Motivo da rejeição...</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button disabled className="w-full py-4 bg-slate-100 text-slate-300 font-bold rounded-xl cursor-not-allowed">Reenviar nota fiscal</button>
          <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        <div className="w-20 h-20 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#FFFBEB]/50">
          <Trash2 className="text-[#D97706]" size={32} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">Exclusão de nota fiscal</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed px-4">Tem certeza que deseja excluir a nota fiscal?</p>
        </div>
        <div className="space-y-3">
          <button onClick={onConfirm} className="w-full py-4 bg-[#D93025] hover:bg-[#B7231A] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]">Sim, excluir</button>
          <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Não, cancelar</button>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, title, description, icon: Icon }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        <div className="w-20 h-20 bg-[#E6F6F7] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E6F6F7]/50">
          <Icon className="text-[#00A3B1]" size={36} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#002B49]">{title}</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">{description}</p>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98]">Fechar</button>
      </motion.div>
    </div>
  );
};

export default InvoicesView;
