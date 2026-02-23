const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../components/consultant/InvoicesView.tsx');

const newContent = `
import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Search,
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
  FileSearch,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

// Updated Invoice interface to include new fields
interface Invoice {
  id: string;
  lote: string;
  valor: number;
  arquivo: string;
  dataEnvio: string;
  status: 'Aprovada' | 'Rejeitada' | 'Pendente' | 'Em análise' | 'Paga';
  motivoRejeicao?: string;
  fileUrl?: string;
  mes_referencia?: number;
  ano_referencia?: number;
  data_pagamento?: string;
}

interface InvoicesViewProps {
  userProfile?: any;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const InvoicesView: React.FC<InvoicesViewProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<'meses' | 'historico'>('meses');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [uploadContext, setUploadContext] = useState<{ mes: number, ano: number, valor: number } | null>(null);
  
  const [showSuccessSent, setShowSuccessSent] = useState(false);
  const [showSuccessDeleted, setShowSuccessDeleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyValues, setMonthlyValues] = useState<Record<number, number>>({});

  const fetchInvoicesAndCommissions = async () => {
    if (!userProfile?.id) return;
    setLoading(true);
    try {
      // 1. Fetch Invoices History
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('creator_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (invError) throw invError;

      const mappedInvoices: Invoice[] = (invData || []).map((inv: any) => ({
        id: inv.id,
        lote: inv.titulo || 'Sem título',
        valor: typeof inv.valor === 'number' ? inv.valor : parseFloat(inv.valor) || 0,
        arquivo: inv.arquivo_url ? inv.arquivo_url.split('/').pop() : 'arquivo.pdf',
        fileUrl: inv.arquivo_url,
        dataEnvio: new Date(inv.created_at).toLocaleString('pt-BR'),
        status: (inv.status_nf as any) || 'Pendente',
        motivoRejeicao: inv.motivo,
        mes_referencia: inv.mes_referencia,
        ano_referencia: inv.ano_referencia,
        data_pagamento: inv.data_pagamento ? new Date(inv.data_pagamento).toLocaleDateString('pt-BR') : undefined
      }));

      setInvoices(mappedInvoices);

      // 2. Fetch Commissions from calendario/pagamentos for the selected year
      const firstDay = new Date(selectedYear, 0, 1).toISOString();
      const lastDay = new Date(selectedYear + 1, 0, 0).toISOString();

      const { data: comData, error: comError } = await supabase
        .from('calendario/pagamentos')
        .select('data, comissao_consultor')
        .eq('consultor_id', userProfile.id)
        .gte('data', firstDay)
        .lte('data', lastDay);

      if (comError) {
        console.error('Error fetching commissions:', comError);
      } else {
        const valuesByMonth: Record<number, number> = {};
        for (let i = 1; i <= 12; i++) valuesByMonth[i] = 0;

        (comData || []).forEach((item: any) => {
          if (item.data && item.comissao_consultor) {
            const dateObj = new Date(item.data);
            const month = dateObj.getMonth() + 1; // 1-12
            // add to sum
            valuesByMonth[month] += Number(item.comissao_consultor) || 0;
          }
        });
        setMonthlyValues(valuesByMonth);
      }

    } catch (error: any) {
      console.error('Erro ao buscar notas fiscais:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesAndCommissions();
  }, [userProfile?.id, selectedYear]);

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
    setUploadContext(null);
    setShowSuccessSent(true);
    fetchInvoicesAndCommissions(); // Refresh list
  };

  const openUploadForMonth = (mes: number) => {
    const val = monthlyValues[mes] || 0;
    setUploadContext({ mes, ano: selectedYear, valor: val });
    setIsUploadModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      'Aprovada': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
      'Paga': 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10',
      'Rejeitada': 'bg-[#FFF5F2] text-[#FF7A59] border-[#FF7A59]/10',
      'Em análise': 'bg-blue-50 text-blue-500 border-blue-100',
      'Pendente': 'bg-slate-50 text-slate-400 border-slate-200'
    };
    return (
      <span className={\`px-3 py-1 rounded-full text-[10px] font-bold border \${styles[status] || styles['Pendente']}\`}>
        {status || 'Pendente'}
      </span>
    );
  };

  // Generate Months List (Current month first conceptually, but usually listed Jan-Dec or ordered by relativity)
  // According to requirements: "Garantir que o mês atual apareça sempre no topo da lista."
  const currentMonthIdx = new Date().getMonth(); // 0-11
  const sortedMonths = useMemo(() => {
    const monthsArr = Object.keys(MONTHS).map(k => Number(k));
    // If we want current month on top (only makes sense if we are in current year)
    if (selectedYear === new Date().getFullYear()) {
       const before = monthsArr.filter(m => m < currentMonthIdx);
       const afterAndCurrent = monthsArr.filter(m => m >= currentMonthIdx);
       return [...afterAndCurrent, ...before];
    }
    return monthsArr; // Jan-Dec for other years
  }, [selectedYear]);

  return (
    <div className="max-w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <span className="text-[#00A3B1] font-bold">Nota fiscal</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#002B49]">Nota fiscal de comissão</h2>
        
        {/* Tabs for Meses vs Histórico */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('meses')}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'meses' ? 'bg-white text-[#002B49] shadow-sm' : 'text-slate-400 hover:text-slate-600'}\`}
            >
                Meses
            </button>
            <button 
                onClick={() => setActiveTab('historico')}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'historico' ? 'bg-white text-[#002B49] shadow-sm' : 'text-slate-400 hover:text-slate-600'}\`}
            >
                Histórico
            </button>
        </div>
      </div>

      {activeTab === 'meses' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider flex items-center gap-2">
                        <CalendarDays size={18} className="text-[#00A3B1]" />
                        Ciclo de Faturamento
                    </h3>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-500">Ano de ref:</label>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 text-[#002B49] text-sm rounded-xl focus:ring-[#00A3B1] focus:border-[#00A3B1] block px-4 py-2 font-bold outline-none cursor-pointer"
                        >
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-[#F8FAFB] border-b border-slate-100 rounded-xl">
                            <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                                <th className="px-6 py-4 rounded-tl-xl">Mês de Referência</th>
                                <th className="px-6 py-4">Valor a Faturar</th>
                                <th className="px-6 py-4">Status no Mês</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                        Carregando faturamentos...
                                    </td>
                                </tr>
                            ) : sortedMonths.map((monthIdx) => {
                                const mesNum = monthIdx + 1;
                                const val = monthlyValues[mesNum] || 0;
                                const isCurrentMonth = selectedYear === new Date().getFullYear() && currentMonthIdx === monthIdx;
                                
                                // Find if there's an invoice for this month
                                const invoiceForMonth = invoices.find(i => i.mes_referencia === mesNum && i.ano_referencia === selectedYear);

                                return (
                                    <tr key={monthIdx} className={\`text-sm hover:bg-slate-50 transition-colors group \${isCurrentMonth ? 'bg-[#F0FAFB]' : ''}\`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#002B49] font-bold capitalize">{MONTHS[monthIdx]}</span>
                                                {isCurrentMonth && (
                                                    <span className="px-2 py-0.5 bg-[#00A3B1]/10 text-[#00A3B1] rounded text-[9px] font-bold uppercase tracking-wider">Atual</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[#002B49] font-bold">
                                            {formatCurrency(val)}
                                        </td>
                                        <td className="px-6 py-5">
                                            {invoiceForMonth ? (
                                                <StatusBadge status={invoiceForMonth.status} />
                                            ) : (
                                                <span className="text-slate-400 text-xs font-medium italic">Aguardando envio</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {invoiceForMonth ? (
                                                <button 
                                                    onClick={() => setSelectedInvoice(invoiceForMonth)}
                                                    className="inline-flex items-center gap-2 text-[#00A3B1] hover:text-[#008c99] text-xs font-bold transition-colors"
                                                >
                                                    <Eye size={14} /> Ver Nota
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openUploadForMonth(mesNum)}
                                                    disabled={val <= 0}
                                                    className="inline-flex items-center justify-center bg-[#002B49] hover:bg-[#001D32] disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
                                                >
                                                    Enviar Nota
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
           </div>
        </motion.div>
      )}

      {activeTab === 'historico' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider flex items-center justify-between">
                <span>Histórico de envios</span>
                {/* Free upload button for notes outside standard monthly cycle if needed, but we can hide it to force cycle */}
                <button
                    onClick={() => {
                        setUploadContext(null);
                        setIsUploadModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
                >
                    <Plus size={16} /> Nota Adicional
                </button>
            </h3>

            {loading ? (
            <div className="py-20 flex justify-center text-slate-400">Carregando histórico...</div>
            ) : invoices.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-32 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-[#B2E7EC]/30 rounded-2xl flex items-center justify-center mb-6">
                <FileSearch className="text-[#00A3B1]" size={32} />
                </div>
                <h4 className="text-base font-bold text-[#002B49] mb-2">Nenhuma nota enviada.</h4>
                <p className="text-sm text-slate-400 font-medium max-w-sm">
                Histórico vazio. Utilize a aba "Meses" para enviar a nota fiscal referente a um ciclo de faturamento.
                </p>
            </div>
            ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-[#F8FAFB] border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        <th className="px-6 py-5">Lote / Ref</th>
                        <th className="px-6 py-5">Valor</th>
                        <th className="px-6 py-5">Data de envio</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Pagamento</th>
                        <th className="px-6 py-5">Motivo rejeição</th>
                        <th className="px-6 py-5 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="text-sm hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5">
                            <div className="text-[#002B49] font-medium">{inv.lote}</div>
                            {inv.mes_referencia && inv.ano_referencia && (
                                <div className="text-[10px] text-[#00A3B1] font-bold uppercase tracking-wider mt-1">
                                    Ref: {MONTHS[inv.mes_referencia - 1]} {inv.ano_referencia}
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-5 text-[#002B49] font-bold">{formatCurrency(inv.valor)}</td>
                        <td className="px-6 py-5 text-slate-500 text-xs font-medium">{inv.dataEnvio}</td>
                        <td className="px-6 py-5"><StatusBadge status={inv.status} /></td>
                        <td className="px-6 py-5 text-slate-500 text-xs font-medium">
                            {inv.data_pagamento || '-'}
                        </td>
                        <td className="px-6 py-5 text-slate-400 text-xs max-w-[200px] truncate">{inv.motivoRejeicao || '-'}</td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => setSelectedInvoice(inv)}
                                    className="p-2 bg-slate-100 text-[#002B49] hover:bg-[#002B49] hover:text-white rounded-lg transition-colors flex items-center justify-center"
                                    title="Visualizar Detalhes"
                                >
                                    <Eye size={16} />
                                </button>
                                {['Pendente', 'Em análise'].includes(inv.status) && (
                                    <button
                                        onClick={() => setInvoiceToDelete(inv)}
                                        className="p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex items-center justify-center"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            )}
        </motion.div>
      )}

      {/* Modals */}
      <UploadInvoiceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleInvoiceUploaded}
        userProfile={userProfile}
        uploadContext={uploadContext}
        MONTHS={MONTHS}
      />
      <ViewInvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        formatCurrency={formatCurrency}
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
        description="A nota fiscal foi enviada com sucesso e ficará 'Em análise' até a revisão do setor financeiro."
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

const UploadInvoiceModal = ({ isOpen, onClose, onSuccess, userProfile, uploadContext, MONTHS }: any) => {
  const isContextMode = !!uploadContext;
  
  const defaultTitle = isContextMode ? \`Ref: \${MONTHS[uploadContext.mes - 1]} \${uploadContext.ano}\` : '';
  const defaultValStr = isContextMode ? uploadContext.valor.toFixed(2).replace('.', ',') : '';

  const [title, setTitle] = useState(defaultTitle);
  const [value, setValue] = useState(defaultValStr);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Sync state if context changes
  useEffect(() => {
    if (isOpen) {
        setTitle(defaultTitle);
        setValue(defaultValStr);
        setFile(null);
    }
  }, [isOpen, defaultTitle, defaultValStr]);

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
      alert("Preencha todos os campos obrigatórios e anexe o PDF.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${Date.now()}_\${Math.floor(Math.random() * 1000)}.\${fileExt}\`;
      const filePath = \`\${userProfile.id}/\${fileName}\`;

      // 1. Upload File
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

      if (uploadError) throw new Error('Falha no upload do arquivo. ' + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath);

      // 2. Insert Record
      const numericValue = parseFloat(value.replace(/\\./g, '').replace(',', '.').replace('R$', '').trim());
      
      const insertData: any = {
        titulo: title,
        valor: isNaN(numericValue) ? 0 : numericValue,
        arquivo_url: publicUrl,
        status_nf: 'Em análise', // Force 'Em análise' immediately over 'Pendente' per spec
        creator_id: userProfile.id,
      };

      if (isContextMode) {
          insertData.mes_referencia = uploadContext.mes;
          insertData.ano_referencia = uploadContext.ano;
      }

      const { error: dbError } = await supabase
        .from('invoices')
        .insert(insertData);

      if (dbError) throw new Error('Falha ao salvar registro no banco. ' + dbError.message);

      // 3. Register Notification for admin
      const notificacaoNome = userProfile.nome_fantasia || userProfile.nome || 'Consultor';
      await supabase.from('notificacoes').insert({
        titulo: 'Nova nota fiscal enviada',
        mensagem: \`\${notificacaoNome} enviou uma nova nota fiscal para análise (\${title}).\`,
        tipo: 'admin',
        lida: false
      });

      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatCurrencyLocal = (val: string) => {
    let v = val.replace(/\\D/g, '');
    v = (parseInt(v) / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/(\\d)(\\d{3})(\\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\\d)(\\d{3}),/g, "$1.$2,");
    return v;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full space-y-8 shadow-2xl relative">
        <button onClick={onClose} disabled={uploading} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        <div className="w-14 h-14 bg-[#B2E7EC]/40 rounded-2xl flex items-center justify-center">
          <FileText className="text-[#00A3B1]" size={28} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-[#002B49]">Enviar nota fiscal</h3>
            {isContextMode && (
                <p className="text-xs text-slate-400 mt-1">Referente a {MONTHS[uploadContext.mes - 1]} / {uploadContext.ano}</p>
            )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Título da nota <span className="text-[#00A3B1]">*</span></label>
            <input
              type="text"
              placeholder="Ex.: Comissão"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isContextMode}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#002B49]">Valor faturado <span className="text-[#00A3B1]">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="text"
                placeholder="0,00"
                value={value}
                onChange={(e) => {
                  if (isContextMode) return;
                  const raw = e.target.value;
                  if (raw === '') setValue('');
                  else setValue(formatCurrencyLocal(raw));
                }}
                disabled={isContextMode}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] outline-none transition-all disabled:bg-slate-50 disabled:text-[#00A3B1] disabled:border-[#00A3B1]/20"
              />
            </div>
          </div>

          {!file ? (
            <div
              className={\`w-full h-32 border-2 border-dashed rounded-[2rem] bg-[#F8FAFB] flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-slate-50 transition-all \${dragActive ? 'border-[#00A3B1] bg-slate-50' : 'border-slate-100'}\`}
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
                <span className="text-slate-900 font-bold">Clique para carregar</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold">Apenas PDF</p>
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
                <button onClick={() => setFile(null)} disabled={uploading} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2 bg-[#F0FAFB] text-[#00A3B1] p-3 rounded-xl border border-[#B2E7EC] text-[11px] font-medium">
             <AlertCircle size={16} className="shrink-0 mt-0.5" />
             <p>A nota ficará "Em análise" e será revisada pelo setor financeiro.</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full py-4 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-xl shadow-lg shadow-[#00A3B1]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? 'Enviando...' : 'Confirmar Envio da Nota'}
          </button>
          <button onClick={onClose} disabled={uploading} className="w-full py-4 bg-white border border-slate-200 text-[#64748B] font-bold rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        </div>
      </motion.div>
    </div>
  );
};

const ViewInvoiceModal = ({ isOpen, onClose, invoice, formatCurrency }: any) => {
  if (!isOpen || !invoice) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#002B49]/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full space-y-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 bg-[#B2E7EC]/40 rounded-2xl flex items-center justify-center">
            <FileText className="text-[#00A3B1]" size={28} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#002B49]">Detalhes da nota</h3>

        <div className="space-y-6">
          <div className="space-y-1 border-b border-slate-50 pb-4">
             <p className="text-xs text-slate-400">Título / Referência</p>
             <p className="text-sm font-bold text-[#002B49]">{invoice.lote}</p>
          </div>
          <div className="space-y-1 border-b border-slate-50 pb-4">
             <p className="text-xs text-slate-400">Valor</p>
             <p className="text-sm font-bold text-[#00A3B1]">{formatCurrency(invoice.valor)}</p>
          </div>
          <div className="space-y-1 border-b border-slate-50 pb-4">
             <p className="text-xs text-slate-400">Status</p>
             <p className="text-sm font-bold text-[#002B49]">{invoice.status}</p>
          </div>
          
          <div className="p-4 border border-slate-100 rounded-2xl space-y-3 cursor-pointer hover:bg-slate-50 hover:border-[#00A3B1]/20 transition-all group" onClick={() => window.open(invoice.fileUrl, '_blank')}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00A3B1]/5 rounded-lg flex items-center justify-center text-[#00A3B1] group-hover:bg-[#00A3B1]/10">
                  <FileText size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[#002B49]">{invoice.arquivo}</p>
                  <p className="text-[#00A3B1] font-bold">Visualizar PDF</p>
                </div>
              </div>
            </div>
          </div>

          {invoice.status === 'Rejeitada' && (
            <div className="flex items-start gap-3 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider">Motivo da Rejeição</p>
                  <p className="text-sm font-medium leading-relaxed">{invoice.motivoRejeicao || 'Motivo não informado.'}</p>
              </div>
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
`;

fs.writeFileSync(targetPath, newContent, 'utf-8');
console.log('Success completely replacing InvoicesView.tsx');
