import React from 'react';
import { Play, Share2, Download, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Clip } from '../types.ts';

interface ClipListProps {
  clips: Clip[];
  onSelect: (clip: Clip) => void;
  selectedClipId?: string;
}

export const ClipList: React.FC<ClipListProps> = ({ clips, onSelect, selectedClipId }) => {
  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-zinc-800 rounded-xl bg-zinc-900/30">
        <div className="w-12 h-12 rounded-full border border-dashed border-zinc-800 flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-zinc-800" />
        </div>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Aguardando Extração...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
      {clips.map((clip, index) => {
        const metadata = JSON.parse(clip.metadata || '{}');
        const duration = (clip.endTime - clip.startTime).toFixed(1);
        
        return (
          <motion.div
            key={clip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(clip)}
            className={`group p-4 rounded-xl border transition-all cursor-pointer ${
              selectedClipId === clip.id 
                ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">SEGMENTO_0{index + 1}</span>
                  <div className="h-1 w-1 rounded-full bg-zinc-800" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{duration}s</span>
                </div>
                <h3 className="text-white font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {clip.title}
                </h3>
              </div>
              <div className="flex items-center space-x-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                <TrendingUp className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-mono text-white font-bold">{clip.viralScore}</span>
              </div>
            </div>

            <p className="text-zinc-500 text-xs mb-4 line-clamp-2 italic font-mono">
              {metadata.reasoning}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="flex space-x-3">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <button 
                className={`flex items-center space-x-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedClipId === clip.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Exportar 9:16</span>
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
