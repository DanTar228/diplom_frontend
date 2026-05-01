import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2 } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import FileUploader from './components/FileUploader';
import MusicDisplay from './components/MusicDisplay';
import { transcribeAudio } from './services/api';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme as 'light' | 'dark') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [musicxml, setMusicxml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transcribeAudio(file);
      console.log(result)
      setMusicxml(result.musicxml);
    } catch (err: any) {
      console.error(err);
      setError('Произошла ошибка при транскрибации. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMusicxml(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] transition-colors duration-300 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-black/50 backdrop-blur-md sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Music2 size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              NotaTranscribe <span className="text-indigo-600 font-medium text-sm align-top">v1.2</span>
            </h1>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          {!musicxml ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 serif leading-[1.1]">
                  Превратите музыку в нотную грамоту
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Загрузите ваш аудио файл, и наш ИИ автоматически создаст ноты в формате MusicXML. 
                  Профессиональное качество транскрибации.
                </p>
              </div>

              <FileUploader onUpload={handleUpload} isLoading={isLoading} />

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 font-medium text-sm"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="display">
              <MusicDisplay 
                musicxml={musicxml} 
                theme={theme} 
                onReset={handleReset} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-10 bg-slate-800 text-slate-400 px-8 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
        <div className="flex gap-6">
          <span>Статус API: <span className="text-green-400">Активен</span></span>
          <span className="hidden sm:inline">Задержка: 142мс</span>
        </div>
        <div>
          © 2026 NotaTranscribe AI Engine
        </div>
      </footer>
    </div>
  );
}
