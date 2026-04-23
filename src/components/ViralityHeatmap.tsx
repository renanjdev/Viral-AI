import React from 'react';

export const ViralityHeatmap: React.FC = () => {
  // Generate random bars to simulate heatmap
  const bars = Array.from({ length: 40 }, () => Math.random());

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
        <span>Mapa de Viralidade</span>
        <span>Pico Detectado: Alta Amplitude</span>
      </div>
      <div className="h-12 w-full flex gap-[1px]">
        {bars.map((height, i) => (
          <div 
            key={i}
            className="flex-1 rounded-sm transition-all hover:scale-y-110"
            style={{ 
              height: `${height * 100}%`,
              backgroundColor: height > 0.7 ? '#818cf8' : height > 0.4 ? '#4338ca' : '#1e1b4b',
              opacity: height > 0.8 ? 1 : 0.6
            }}
          />
        ))}
      </div>
    </div>
  );
};
