import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Loader2, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle: string;
    contractId?: string;
    stepType?: string; // 'assinatura', 'comprovante', etc
    clicksignEnvelopeId?: string;
    comprovanteUrl?: string;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
    isOpen,
    onClose,
    documentTitle,
    contractId,
    stepType,
    clicksignEnvelopeId,
    comprovanteUrl
}) => {
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isSigned, setIsSigned] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        if (!isOpen) {
            // Cleanup blob URL when closing
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
            setIsSigned(false);
            setError(null);
            return;
        }

        if (stepType === 'assinatura' && contractId) {
            fetchContractPdf();
        } else if (stepType === 'comprovante' && comprovanteUrl) {
            setPdfUrl(comprovanteUrl);
        }
    }, [isOpen, contractId, stepType]);

    const fetchContractPdf = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/admin/contracts/${contractId}/pdf`);
            if (!res.ok) throw new Error('Falha ao carregar documento');

            // Check if it's signed (header set by backend)
            const signedHeader = res.headers.get('X-Contract-Signed');
            setIsSigned(signedHeader === 'true');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err: any) {
            console.error('Error fetching contract PDF:', err);
            setError(err.message || 'Erro ao carregar documento');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `contrato_${contractId || 'documento'}.pdf`;
        link.click();
    };

    const handlePrint = () => {
        if (!pdfUrl) return;
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                printWindow.print();
            });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-[#002B49] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">{documentTitle}</h3>
                                {stepType === 'assinatura' && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {isSigned ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[11px] text-emerald-300 font-medium">Documento assinado via Clicksign</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3 h-3 text-amber-400" />
                                                <span className="text-[11px] text-amber-300 font-medium">Aguardando assinatura</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {pdfUrl && (
                                <>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors text-sm font-medium"
                                        title="Baixar documento"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Baixar</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors text-sm font-medium"
                                        title="Imprimir documento"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span className="hidden sm:inline">Imprimir</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-100 overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <Loader2 className="w-8 h-8 text-[#009ca6] animate-spin" />
                                <p className="text-sm text-slate-500 font-medium">Carregando documento...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-7 h-7 text-red-400" />
                                </div>
                                <p className="text-sm text-slate-500">{error}</p>
                                <button
                                    onClick={fetchContractPdf}
                                    className="text-sm text-[#009ca6] hover:underline font-medium"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border-0"
                                title={documentTitle}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                                <FileText className="w-12 h-12 opacity-30" />
                                <p className="text-sm">Nenhum documento disponível</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DocumentViewerModal;
