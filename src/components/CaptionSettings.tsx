import React, { useState } from 'react';
import { Type, Palette, Sparkles, Languages, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CaptionSettingsProps {
  onUpdate: (settings: any) => void;
}

export const CaptionSettings: React.FC<CaptionSettingsProps> = ({ onUpdate }) => {
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [selectedFont, setSelectedFont] = useState('Inter Bold');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [animation, setAnimation] = useState('pop');

  const fonts = ['Inter Bold', 'Space Grotesk', 'JetBrains Mono', 'Impact'];
  const colors = ['#ffffff', '#818cf8', '#f87171', '#fbbf24'];

  const handleUpdate = (updates: any) => {
    onUpdate({ autoCaptions, selectedFont, selectedColor, animation, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-zinc-200">Legendas Automáticas</span>
        </div>
        <button 
          onClick={() => {
            const next = !autoCaptions;
            setAutoCaptions(next);
            handleUpdate({ autoCaptions: next });
          }}
          className={`w-10 h-5 rounded-full transition-colors relative ${autoCaptions ? 'bg-indigo-600' : 'bg-zinc-800'}`}
        >
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${autoCaptions ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono text-zinc-500 flex items-center gap-2">
            <Type className="w-3 h-3" /> Tipografia
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fonts.map(font => (
              <button
                key={font}
                onClick={() => {
                  setSelectedFont(font);
                  handleUpdate({ selectedFont: font });
                }}
                className={`text-[10px] py-2 px-3 rounded border transition-all text-left ${
                  selectedFont === font 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono text-zinc-500 flex items-center gap-2">
            <Palette className="w-3 h-3" /> Cores de Destaque
          </label>
          <div className="flex gap-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  handleUpdate({ selectedColor: color });
                }}
                className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <Check className="w-4 h-4 text-zinc-950" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono text-zinc-500 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Estilo de Animação
          </label>
          <select 
            value={animation}
            onChange={(e) => {
              setAnimation(e.target.value);
              handleUpdate({ animation: e.target.value });
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-400 font-mono outline-none focus:border-indigo-500"
          >
            <option value="pop">Efeito de Pop (Alex Hormozi)</option>
            <option value="fade">Desvanecimento Suave</option>
            <option value="roll">Rolo de Texto</option>
            <option value="none">Sem Animação</option>
          </select>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono italic">
            <Languages className="w-3 h-3" />
            <span>Processamento em: Português (Brasil)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
