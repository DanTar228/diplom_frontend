import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import PlaybackEngine from 'osmd-audio-player';
import { Download, RefreshCw, Play, Pause, Square } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicDisplayProps {
  musicxml: string | null;
  theme: 'light' | 'dark';
  onReset: () => void;
}

export default function MusicDisplay({ musicxml, theme, onReset }: MusicDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const playbackEngineRef = useRef<PlaybackEngine | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initOSMD = async () => {
      if (!containerRef.current || !musicxml) return;

      // Очистка контейнера
      containerRef.current.innerHTML = '';
      
      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        drawTitle: true,
        darkMode: theme === 'dark',
        drawingParameters: 'compacttight',
        // Цвет курсора (можно настроить под тему)
        cursorsOptions: [{
          type: 0,
          color: theme === 'dark' ? '#6366f1' : '#334155',
          alpha: 0.5,
          follow: true
        }]
      });
      
      osmdRef.current = osmd;

      try {
        await osmd.load(musicxml);
        osmd.render();
        
        const playbackEngine = new PlaybackEngine();
        await playbackEngine.loadScore(osmd);
        
        // Настройка обработчиков событий для синхронизации курсора
        playbackEngine.on('iteration', (notes: any) => {
          // Если по какой-то причине авто-движение не работает, 
          // здесь можно принудительно вызвать:
          if (notes.length == 0){
            if (!playbackEngineRef.current) return;
            playbackEngineRef.current.stop();
            osmdRef.current?.cursor.reset();
            setIsPlaying(false);
          }
          osmd.cursor.next(); 
          console.log('Playing notes:', notes);
        });


        playbackEngineRef.current = playbackEngine;
        
        // ВАЖНО: Показываем курсор ПОСЛЕ рендеринга и загрузки в движок
        osmd.cursor.show();
        setIsReady(true);

      } catch (err) {
        console.error('OSMD Error:', err);
      }
    };

    initOSMD();

    return () => {
      if (playbackEngineRef.current) {
        playbackEngineRef.current.stop();
      }
    };
  }, [musicxml, theme]);

  const togglePlay = async () => {
    if (!playbackEngineRef.current) return;
    
    if (isPlaying) {
      playbackEngineRef.current.pause();
    } else {
      // Убеждаемся, что курсор виден перед стартом
      osmdRef.current?.cursor.show();
      await playbackEngineRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    if (!playbackEngineRef.current) return;
    playbackEngineRef.current.stop();
    osmdRef.current?.cursor.reset();
    // Скрывать не обязательно, но можно: osmdRef.current?.cursor.hide();
    setIsPlaying(false);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto mt-8 p-4 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 serif">
            Результат транскрибации
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic mt-1">
            {isReady ? 'Готово к воспроизведению' : 'Загрузка нот...'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2 mr-4 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              disabled={!isReady}
              onClick={togglePlay}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${
                isPlaying 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm'
              }`}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              {isPlaying ? 'Пауза' : 'Играть'}
            </button>
            <button
              disabled={!isReady}
              onClick={stopPlayback}
              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              title="Стоп"
            >
              <Square size={16} fill="currentColor" />
            </button>
          </div>

          <button
            onClick={downloadMusicXML}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
          >
            <Download size={14} />
            Скачать
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div 
        className={`w-full min-h-[500px] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors p-4 relative
          ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          /* Фикс для видимости курсора */
          #osmdCanvasPage1 {
            z-index: 1;
          }
          .osmdCursor {
            z-index: 10 !important;
            pointer-events: none;
          }
        `}} />
        <div 
          ref={containerRef} 
          id="osmd-container" 
          className="w-full" 
          style={{ position: 'relative' }} 
        />
      </div>
    </motion.div>
  );
}