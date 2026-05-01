import React, { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Download, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicDisplayProps {
  musicxml: string | null;
  theme: 'light' | 'dark';
  onReset: () => void;
}

export default function MusicDisplay({ musicxml, theme, onReset }: MusicDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (containerRef.current && musicxml) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        drawTitle: true,
        drawSubtitle: true,
        drawComposer: true,
        drawLyricist: true,
        drawPartNames: true,
        darkMode: theme === 'dark',
      });
      
      osmdRef.current = osmd;
      
      osmd.load(musicxml).then(() => {
        osmd.render();
      }).catch(err => {
        console.error('OSMD Error:', err);
      });
    }
  }, [musicxml, theme]);

  const downloadMusicXML = () => {
    if (!musicxml) return;
    const blob = new Blob([musicxml], { type: 'application/vnd.recordare.musicxml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.musicxml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!musicxml) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto mt-8 p-4 sm:p-8"
      id="music-display-container"
    >
      <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 serif">
            Результат транскрибации
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic mt-1">
            Формат: MusicXML • Качество: Высокое
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadMusicXML}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-bold shadow-lg shadow-slate-900/10 dark:shadow-indigo-900/20 uppercase tracking-wider"
            id="download-xml"
          >
            <Download size={14} />
            Скачать
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-wider"
            id="reset-transcription"
          >
            <RefreshCw size={14} />
            Сбросить
          </button>
        </div>
      </div>

      <div 
        className={`w-full min-h-[600px] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto transition-colors p-6 sm:p-10
          ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'}`}
      >
        <div ref={containerRef} id="osmd-container" className="w-full" />
      </div>
    </motion.div>
  );
}
