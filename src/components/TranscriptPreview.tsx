import React from 'react';

export const TranscriptPreview: React.FC = () => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col border border-zinc-800 rounded-lg bg-zinc-900/30">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Log de Transcrição IA</span>
        <span className="text-[10px] text-indigo-400 font-mono">SENTIMENTO: ANALISANDO...</span>
      </div>
      <div className="p-4 text-[11px] leading-relaxed text-zinc-400 font-mono overflow-auto h-40 custom-scrollbar">
        <p className="mb-2"><span className="text-indigo-500 mr-2">[00:04]</span> "Bem-vindos de volta pessoal, hoje vamos mergulhar na arquitetura..."</p>
        <p className="mb-2"><span className="text-indigo-500 mr-2">[00:12]</span> "O principal desafio que enfrentamos foi lidar com o pico de tráfego..."</p>
        <p className="mb-2"><span className="text-indigo-500 mr-2">[00:25]</span> "Percebemos que o escalonamento horizontal era apenas uma peça do quebra-cabeça."</p>
        <p className="mb-2 opacity-50"><span className="text-indigo-500 mr-2">[00:42]</span> "Se você olhar para a implementação do Redis aqui, verá por que a latência importa."</p>
        <p className="mb-2 opacity-30"><span className="text-indigo-500 mr-2">[00:58]</span> "Buffering de streams de entrada para coleta de lixo eficiente..."</p>
      </div>
    </div>
  );
};
