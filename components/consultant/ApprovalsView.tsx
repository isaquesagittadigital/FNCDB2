
import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Process {
  id: string;
  cliente: string;
  consultor: string;
  codContrato: string;
  aporte: string;
  documento: string;
  status: 'Aprovado' | 'Pendente';
}

const ApprovalsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  const processes: Process[] = [
    { id: '1', cliente: 'Isaque testes da silva', consultor: 'Samuel Alves', codContrato: '23042849', aporte: 'R$ 30.000,00', documento: '047.253.905-18', status: 'Aprovado' },
    { id: '2', cliente: 'Samuel Alves de Souza', consultor: 'Ricardo Ricchini Contesini', codContrato: '15368767', aporte: 'R$ 49.000,00', documento: '416.255.138-36', status: 'Aprovado' },
    { id: '3', cliente: 'Samuel Alves de Souza', consultor: 'Renan Furlan Rigo 4', codContrato: '17900772', aporte: 'R$ 10.000,00', documento: '416.255.138-36', status: 'Pendente' },
    { id: '4', cliente: 'Renan Furlan Rigo', consultor: 'Renan Furlan Rigo 4', codContrato: '65119088', aporte: 'R$ 10.000,00', documento: '345.255.618-23', status: 'Aprovado' },
    { id: '5', cliente: 'Carlos Casa Nova', consultor: 'Jacson Daniel de Almeida dos Santos', codContrato: '05515482', aporte: 'R$ 51.000,00', documento: '047.253.905-79', status: 'Aprovado' },
    { id: '6', cliente: 'Samuel Alves de Souza', consultor: 'Samuel Alves', codContrato: '58022492', aporte: 'R$ 50.000,00', documento: '416.255.138-36', status: 'Pendente' },
    { id: '7', cliente: 'Isaque testes da silva', consultor: 'Samuel Alves', codContrato: '59308877', aporte: 'R$ 51.000,00', documento: '047.253.905-18', status: 'Aprovado' },
  ];

  const handleViewDetail = (process: Process) => {
    setSelectedProcess(process);
    setViewMode('detail');
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${
      status === 'Aprovado' 
        ? 'bg-[#E6FBF1] text-[#27C27B] border-[#27C27B]/10' 
        : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/10'
    }`}>
      {status}
    </span>
  );

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <button 
          onClick={() => setViewMode('list')}
          className={`font-bold transition-colors ${viewMode === 'list' ? 'text-[#00A3B1]' : 'hover:text-[#00A3B1]'}`}
        >
          Lista de processos
        </button>
        {viewMode === 'detail' && (
          <>
            <span className="opacity-50 font-bold">{'>'}</span>
            <span className="text-slate-400 font-bold">Aprovação</span>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold text-[#002B49]">Lista de processos</h2>
            
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFB] border-b border-slate-100">
                  <tr className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Consultor</th>
                    <th className="px-6 py-4">Cod. Contrato</th>
                    <th className="px-6 py-4">Aporte</th>
                    <th className="px-6 py-4">Documento</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {processes.map((p) => (
                    <tr key={p.id} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5 font-bold text-[#002B49]">{p.cliente}</td>
                      <td className="px-6 py-5 text-slate-500 font-medium">{p.consultor}</td>
                      <td className="px-6 py-5 text-slate-500 font-medium">{p.codContrato}</td>
                      <td className="px-6 py-5 text-[#002B49] font-bold">{p.aporte}</td>
                      <td className="px-6 py-5 text-slate-500 font-medium">{p.documento}</td>
                      <td className="px-6 py-5"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleViewDetail(p)}
                          className="text-[#00A3B1] font-bold hover:underline transition-all"
                        >
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#002B49]">{selectedProcess?.cliente}</h2>
              <p className="text-slate-400 font-medium">Revisão e aprovação do processo de integralização</p>
            </div>

            <div className="space-y-4">
              <ApprovalCard 
                title="Comprovante anexado"
                description="Verificar se o consultor assinou o contrato de prestação de serviços"
                status="Aprovado"
              />
              <ApprovalCard 
                title="Perfil do investidor"
                description="Confirmar que o consultor completou todo o processo de verificação KYC"
                status="Aprovado"
              />
              <ApprovalCard 
                title="Assinatura do contrato"
                description="Verificar se o consultor anexou todos os documentos comprobatórios necessários"
                status="Aprovado"
              />
            </div>

            <button 
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-[#00A3B1] transition-colors pt-4"
            >
              <ArrowLeft size={16} /> Voltar para a lista
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ApprovalCard = ({ title, description, status }: { title: string, description: string, status: string }) => (
  <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-[#E6FBF1] rounded-full flex items-center justify-center text-[#27C27B]">
        <CheckCircle2 size={24} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-bold text-[#002B49]">{title}</h4>
          <span className="bg-[#E6FBF1] text-[#27C27B] text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-[#27C27B]/10 tracking-wider">Aprovado</span>
        </div>
        <p className="text-sm text-slate-400 font-medium">{description}</p>
        <button className="flex items-center gap-2 text-xs font-bold text-[#002B49] border border-slate-200 rounded-lg px-4 py-2 mt-3 hover:bg-slate-50 transition-all shadow-sm">
          <Eye size={16} /> Visualizar documento
        </button>
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
       <span className="px-5 py-2 rounded-full text-[10px] font-bold bg-[#E6FBF1] text-[#27C27B] border border-[#27C27B]/10">Aprovado</span>
    </div>
  </div>
);

export default ApprovalsView;
