import React, { useState, useRef } from 'react';
import { Upload, Music, X, FileAudio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onUpload, isLoading }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
          ${isDragging 
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]' 
            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900/50'
          }`}
        onClick={() => !file && fileInputRef.current?.click()}
        id="drop-zone"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="hidden"
          name="file"
          id="audio-input"
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center"
            >
              <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-4">
                <Upload size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                Загрузка аудио
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Выбрать файл
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                WAV, MP3, FLAC до 50MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center w-full"
            >
              <div className="relative p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 w-full flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-600 text-white flex-shrink-0">
                  <FileAudio size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate uppercase tracking-tight">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Аудио
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 transition-colors"
                  id="remove-file"
                >
                  <X size={18} />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                className={`mt-8 w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-3 transition-all tracking-wide
                  ${isLoading 
                    ? 'bg-slate-400 cursor-not-allowed text-white' 
                    : 'bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 text-white shadow-xl shadow-slate-900/20 dark:shadow-indigo-900/20'
                  }`}
                id="transcribe-btn"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Music size={18} />
                    </motion.div>
                    ОБРАБОТКА...
                  </>
                ) : (
                  <>
                    <Music size={18} />
                    ТРАНСКРИБИРОВАТЬ
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
