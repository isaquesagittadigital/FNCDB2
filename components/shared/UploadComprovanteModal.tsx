import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, CheckCircle2, Loader2, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadComprovanteModalProps {
    contractId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const UploadComprovanteModal: React.FC<UploadComprovanteModalProps> = ({ contractId, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [dataTransferencia, setDataTransferencia] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDateForDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && isValidFile(dropped)) {
            setFile(dropped);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const isValidFile = (f: File) => {
        const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        const maxSize = 2 * 1024 * 1024; // 2MB
        return allowed.includes(f.type) && f.size <= maxSize;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && isValidFile(selected)) {
            setFile(selected);
        } else if (selected) {
            alert('Arquivo inválido. Aceitos: PDF, PNG, JPG (máx. 2MB)');
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('data_transferencia', dataTransferencia);

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/contracts/${contractId}/comprovantes/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Erro ao enviar comprovante' }));
                throw new Error(err.error || 'Erro ao enviar');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Upload error:', err);
            alert(err.message || 'Erro ao enviar comprovante.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#002B49]/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden"
                >
                    {/* Header icon */}
                    <div className="pt-6 px-6 pb-0 flex items-start justify-between">
                        <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-[#00A3B1]" size={24} />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-300 hover:text-slate-500 transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 pt-4 space-y-5">
                        <h3 className="text-lg font-bold text-[#002B49]">Anexar arquivo</h3>

                        {/* Data de transferência */}
                        <div>
                            <label className="block text-sm font-semibold text-[#002B49] mb-2">
                                Data de transferência
                            </label>
                            <input
                                type="date"
                                value={dataTransferencia}
                                onChange={(e) => setDataTransferencia(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all bg-white"
                            />
                        </div>

                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`
                                relative flex flex-col items-center justify-center py-8 px-4 
                                border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                                ${dragOver
                                    ? 'border-[#00A3B1] bg-[#E6F6F7]/50'
                                    : file
                                        ? 'border-emerald-300 bg-emerald-50/50'
                                        : 'border-slate-200 bg-slate-50 hover:border-[#00A3B1]/50 hover:bg-[#E6F6F7]/20'
                                }
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {file ? (
                                <>
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle2 className="text-emerald-500" size={20} />
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-700 text-center">{file.name}</p>
                                    <p className="text-xs text-emerald-500 mt-1">
                                        {(file.size / 1024).toFixed(0)} KB — Clique para trocar
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                                        <FileUp className="text-slate-400" size={20} />
                                    </div>
                                    <p className="text-sm text-slate-500 text-center">
                                        Clique para carregar ou arraste e solte PDF (max. 2mb)
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!file || uploading}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200
                                ${file && !uploading
                                    ? 'bg-[#00A3B1] hover:bg-[#008c99] text-white shadow-lg shadow-[#00A3B1]/20 active:scale-[0.98]'
                                    : 'bg-[#E6F6F7] text-[#00A3B1]/50 cursor-not-allowed'
                                }
                            `}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Enviar arquivo
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UploadComprovanteModal;
