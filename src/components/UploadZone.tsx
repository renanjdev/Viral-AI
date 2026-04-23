import React, { useState, useCallback } from 'react';
import { Upload, Video, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onUpload: (file: File, name: string) => void;
  isUploading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [projectName, setProjectName] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0], projectName || e.dataTransfer.files[0].name);
    }
  }, [onUpload, projectName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0], projectName || e.target.files[0].name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
          Designação do Projeto
        </label>
        <input 
          type="text" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="INSIRA O NOME DO PROJETO..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <motion.div
        className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
          dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Iniciando uplink...</p>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-zinc-500 group-hover:text-white" />
            </div>
            <p className="text-white font-medium mb-1">Arraste o vídeo original aqui</p>
            <p className="text-zinc-500 text-sm">ou clique para navegar no sistema</p>
            <div className="mt-8 flex items-center space-x-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
              <Video className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase">APENAS BYTES DE VÍDEO BRUTO</span>
            </div>
          </label>
        )}
      </motion.div>
    </div>
  );
};
