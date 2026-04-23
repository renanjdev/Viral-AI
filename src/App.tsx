import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, Settings, LayoutGrid, List, Activity, Video, Play, Download } from 'lucide-react';
import { io } from 'socket.io-client';
import { Project, Clip } from './types.ts';
import { UploadZone } from './components/UploadZone.tsx';
import { ClipList } from './components/ClipList.tsx';
import { ViralityHeatmap } from './components/ViralityHeatmap.tsx';
import { TranscriptPreview } from './components/TranscriptPreview.tsx';
import { CaptionSettings } from './components/CaptionSettings.tsx';
import { motion, AnimatePresence } from 'motion/react';

const socket = io();

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'clips' | 'style'>('clips');
  const [logs, setLogs] = useState<{ id: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(), message, type }, ...prev].slice(0, 50));
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      addLog("Failed to fetch projects", "error");
    }
  };

  const fetchClips = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/clips`);
      const data = await res.json();
      setClips(data);
    } catch (err) {
      addLog("Failed to fetch clips", "error");
    }
  };

  useEffect(() => {
    fetchProjects();

    socket.on('progress', (data) => {
      addLog(`[${data.step.toUpperCase()}] ${data.message}`, 'info');
      // If the progress is for our current project, we might want to refresh state
      if (currentProject && data.projectId === currentProject.id) {
        if (data.step === 'completed') {
          fetchClips(currentProject.id);
          addLog("Processing complete!", 'success');
        }
      }
    });

    socket.on('clip-ready', (data) => {
      addLog(`NEW CLIP EXTRACTED: ${data.title}`, 'success');
      if (currentProject && data.projectId === currentProject.id) {
        fetchClips(currentProject.id);
      }
    });

    return () => {
      socket.off('progress');
      socket.off('clip-ready');
    };
  }, [currentProject, addLog]);

  const handleUpload = async (file: File, name: string) => {
    setIsUploading(true);
    addLog(`Initiating upload: ${name}`, 'info');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('name', name);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      const newProject: Project = {
        id: data.projectId,
        name,
        originalVideoPath: '',
        status: 'processing',
        createdAt: new Date().toISOString()
      };
      
      setCurrentProject(newProject);
      setClips([]);
      addLog("Upload complete. Handed over to processing engine.", 'success');
      fetchProjects();
    } catch (err) {
      addLog("Upload failed critical check.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Rail */}
      <nav className="fixed left-0 top-0 bottom-0 w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-8 space-y-8 z-50">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 flex flex-col items-center space-y-6 pt-4 text-zinc-500">
          <LayoutGrid title="Dashboard" className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <List title="Projetos" className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Activity title="Métricas" className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Settings title="Configurações" className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 ring-2 ring-indigo-500/20" />
      </nav>

      <main className="ml-16 p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Left Column - Processing & Control */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-bold mb-1">Processador Neural de Vídeo v2.0</p>
              <h1 className="text-4xl font-bold tracking-tight">
                ViralClip <span className="text-indigo-400">Architect</span>
              </h1>
            </div>
            <div className="flex space-x-4">
              <div className="text-right">
                <p className="text-[10px] uppercase text-zinc-500 font-mono">Carga do Sistema</p>
                <div className="flex items-center space-x-1">
                  <div className="h-1 w-24 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500" 
                      animate={{ width: isUploading ? '80%' : '15%' }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white">{isUploading ? '80%' : '15%'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Stage */}
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8 min-h-[500px] flex flex-col">
            {currentProject ? (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentProject.name}</h2>
                    <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{currentProject.id}</p>
                  </div>
                  <div className={`px-4 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest ${
                    currentProject.status === 'processing' ? 'border-indigo-500 text-indigo-500 animate-pulse' : 'border-emerald-500 text-emerald-500'
                  }`}>
                    {currentProject.status === 'processing' ? 'processando' : 'concluído'}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center bg-zinc-950/50 rounded-xl border border-zinc-800 mb-6 overflow-hidden relative">
                  <div className="h-full aspect-[9/16] bg-black relative group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {selectedClip ? (
                      <video 
                        src={selectedClip.path} 
                        controls 
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 px-6 text-center">
                        <div className="w-16 h-16 rounded-full border border-dashed border-zinc-800 flex items-center justify-center">
                          <Play className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Aguardando sinal de vídeo vertical (9:16)</p>
                      </div>
                    )}
                    {/* Subtle Scanline Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
                    
                    {/* Simulated Interface Overlay for TikTok/Reels */}
                    <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4 opacity-30 pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-zinc-800" />
                      <div className="w-8 h-8 rounded-full bg-zinc-800" />
                      <div className="w-8 h-8 rounded-full bg-zinc-800" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-6">
                    <ViralityHeatmap />
                    <div className="bg-zinc-950 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto border border-zinc-800 custom-scrollbar">
                      <div className="flex items-center space-x-2 text-indigo-400 mb-2 border-b border-zinc-800 pb-1">
                        <Terminal className="w-3 h-3" />
                        <span className="uppercase tracking-widest font-bold">Logs de Processamento</span>
                      </div>
                      <AnimatePresence initial={false}>
                        {logs.map((log) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex space-x-2 py-0.5"
                          >
                            <span className="text-zinc-600">[{new Date().toLocaleTimeString('pt-BR', { hour12: false })}]</span>
                            <span className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-zinc-300'}>
                              {log.message}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  <TranscriptPreview />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center">
                <UploadZone onUpload={handleUpload} isUploading={isUploading} />
              </div>
            )}
          </div>
        </section>

        {/* Right Column - Analysis */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 h-full flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button 
                  onClick={() => setActiveTab('clips')}
                  className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-widest transition-all ${
                    activeTab === 'clips' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Segmentos
                </button>
                <button 
                  onClick={() => setActiveTab('style')}
                  className={`px-4 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-widest transition-all ${
                    activeTab === 'style' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Legendas
                </button>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-mono px-2 py-1 border border-indigo-500/20 rounded">
                QUEUE: {clips.length}
              </span>
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'clips' ? (
                  <motion.div
                    key="clips"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <ClipList 
                      clips={clips} 
                      onSelect={setSelectedClip} 
                      selectedClipId={selectedClip?.id} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="style"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <CaptionSettings onUpdate={(s) => addLog(`Estilo atualizado: ${s.selectedFont}`, 'info')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {clips.length > 0 && (
              <div className="space-y-4 mt-8">
                <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Perfil de Exportação</span>
                      <span className="text-sm font-bold text-zinc-200">9:16_OTIMIZADO_TIKTOK</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tempo Est.</span>
                      <span className="text-sm font-mono block text-indigo-400">~120s</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 p-4 bg-indigo-600 rounded-xl text-center group cursor-pointer active:scale-95 transition-transform shadow-[0_10px_30px_rgba(79,70,229,0.2)] text-white font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Executar Exportação em Massa</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Architecture Footer */}
      <footer className="fixed bottom-0 left-16 right-0 h-10 border-t border-zinc-800 bg-zinc-950 flex items-center px-6 justify-between text-[10px] font-mono text-zinc-600 z-50">
        <div className="flex gap-6">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            LATÊNCIA: 8ms
          </span>
          <span>GPU_CACHE: 94% HIT</span>
          <span>ARMAZENAMENTO: 12.4GB</span>
        </div>
        <div className="flex gap-4">
          <span className="text-indigo-400 tracking-widest opacity-60">SISTEMA_ESTÁVEL // BUILD_V1.2.0</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
}
