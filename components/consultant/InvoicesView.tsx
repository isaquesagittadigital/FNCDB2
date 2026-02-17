
import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../lib/supabase';

interface Invoice {
  id: string; // Changed to string (UUID)
  lote: string; // Mapped to 'titulo'
  valor: string; // Mapped from numeric 'valor'
  arquivo: string; // Mapped from 'arquivo_url'
  dataEnvio: string; // Mapped from 'created_at'
  status: 'Aprovada' | 'Rejeitada' | 'Pendente'; // Mapped from 'status_nf'
  motivoRejeicao?: string; // Mapped from 'motivo'
  fileUrl?: string; // Real URL for download/view
}

interface InvoicesViewProps {
  userProfile?: any;
}

const InvoicesView: React.FC<InvoicesViewProps> = ({ userProfile }) => {
  const [view, setView] = useState<'list' | 'empty'>('list'); // 'empty' not strictly used if list check handles it
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [showSuccessSent, setShowSuccessSent] = useState(false);
  const [showSuccessDeleted, setShowSuccessDeleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Fetch Invoices
  const fetchInvoices = async () => {
    if (!userProfile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('creator_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedInvoices: Invoice[] = (data || []).map((inv: any) => ({
        id: inv.id,
        lote: inv.titulo || 'Sem título',
        valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.valor || 0),
        arquivo: inv.arquivo_url ? inv.arquivo_url.split('/').pop() : 'arquivo.pdf',
        fileUrl: inv.arquivo_url,
        dataEnvio: new Date(inv.created_at).toLocaleString('pt-BR'),
        status: (inv.status_nf as any) || 'Pendente',
        motivoRejeicao: inv.motivo
      }));

      setInvoices(mappedInvoices);
    } catch (error: any) {
      console.error('Erro ao buscar notas fiscais:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [userProfile?.id]);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      'Aprovada': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
      'Rejeitada': 'bg-[#FFF5F2] text-[#FF7A59] border-[#FF7A59]/10',
      'Pendente': 'bg-slate-50 text-slate-400 border-slate-200'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${styles[status] || styles['Pendente']}`}>
        {status || 'Pendente'}
      </span>
    );
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete.id);

      if (error) throw error;

      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      setInvoiceToDelete(null);
      setShowSuccessDeleted(true);
    } catch (error: any) {
      alert('Erro ao excluir nota: ' + error.message);
    }
  };

  const handleInvoiceUploaded = () => {
    setIsUploadModalOpen(false);
    setShowSuccessSent(true);
    fetchInvoices(); // Refresh list
  };

  return (
    <div className="max-w-full space-y-6 animate-in fade-in duration-500">
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
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">Carregando notas...</div>
        ) : invoices.length === 0 ? (
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
                      <td className="px-6 py-5 text-[#00A3B1] font-medium hover:underline cursor-pointer" onClick={() => window.open(inv.fileUrl, '_blank')}>
                        {inv.arquivo}
                      </td>
                      <td className="px-6 py-5 text-slate-400">{inv.dataEnvio}</td>
                      <td className="px-6 py-5"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-5 text-slate-400 max-w-[200px] truncate">{inv.motivoRejeicao || '-'}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInvoiceToDelete(inv)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-2 text-slate-300 hover:text-[#00A3B1] transition-colors"
                            title="Visualizar Detalhes"
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
                  <button className="w-8 h-8 rounded-lg text-xs font-bold transition-all bg-[#F8FAFB] text-[#002B49]">
                    1
                  </button>
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
        onSuccess={handleInvoiceUploaded}
        userProfile={userProfile}
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

const UploadInvoiceModal = ({ isOpen, onClose, onSuccess, userProfile }: any) => {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!title || !value || !file || !userProfile?.id) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${userProfile.id}/${fileName}`;

      // 1. Upload File
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

      if (uploadError) throw new Error('Falha no upload do arquivo (Bucket "invoices"). ' + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath);

      // 2. Insert Record
      // Remove "R$" and replace "," with "." for numeric storage
      const numericValue = parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.').trim());

      const { error: dbError } = await supabase
        .from('invoices')
        .insert({
          titulo: title,
          valor: isNaN(numericValue) ? 0 : numericValue,
          arquivo_url: publicUrl,
          status_nf: 'Pendente',
          creator_id: userProfile.id,
          created_at: new Date().toISOString()
        });

      if (dbError) throw new Error('Falha ao salvar registro no banco. ' + dbError.message);

      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (val: string) => {
    // Simple mask logic
    let v = val.replace(/\D/g, '');
    v = (parseInt(v) / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return v;
  };

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
            <input
              type="text"
              placeholder="Ex.: Comissão 20/05/2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Valor da nota <span className="text-[#00A3B1]">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="text"
                placeholder="0,00"
                value={value}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') setValue('');
                  else setValue(formatCurrency(raw));
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] outline-none transition-all"
              />
            </div>
          </div>

          {!file ? (
            <div
              className={`w-full h-32 border-2 border-dashed rounded-[2rem] bg-[#F8FAFB] flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-slate-50 transition-all ${dragActive ? 'border-[#00A3B1] bg-slate-50' : 'border-slate-100'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleChange} />
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 group-hover:text-[#00A3B1] transition-colors">
                <Upload size={20} />
              </div>
              <p className="text-xs font-medium text-slate-400">
                <span className="text-slate-900 font-bold">Clique para carregar</span> ou arraste e solte
              </p>
              <p className="text-[10px] text-slate-300 font-bold uppercase">PDF (max. 2mb)</p>
            </div>
          ) : (
            <div className="p-4 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                    <FileText size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[#002B49] max-w-[150px] truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                      {(file.size / 1024).toFixed(0)} KB <span className="text-[#27C27B] flex items-center gap-1 font-bold"><CheckCircle2 size={12} /> Pronto</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
              {/* Simulated progress bar since actual upload isn't chunked here but instant */}
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-[#00A3B1] rounded-full" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? 'Enviando...' : 'Enviar nota fiscal'}
          </button>
          <button onClick={onClose} disabled={uploading} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
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
          {invoice.status === 'Aprovada' && (
            <span className="px-4 py-1 bg-[#E6FBF1] text-[#27C27B] border border-[#27C27B]/10 rounded-full text-[10px] font-bold">Aprovada</span>
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm"></span>
              <input type="text" value={invoice.valor} readOnly className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#002B49] outline-none" />
            </div>
          </div>

          <div className="p-4 border border-slate-100 rounded-2xl space-y-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.open(invoice.fileUrl, '_blank')}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                  <FileText size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[#002B49]">{invoice.arquivo}</p>
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                    <span className="text-[#00A3B1] flex items-center gap-1 font-bold">Clique para baixar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {invoice.status === 'Rejeitada' && (
            <div className="flex items-start gap-3 text-red-500 bg-red-50 p-4 rounded-xl">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">{invoice.motivoRejeicao || 'Motivo não informado.'}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button onClick={onClose} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Fechar</button>
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
