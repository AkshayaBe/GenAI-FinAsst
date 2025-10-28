import React from 'react';

interface StarterPromptProps {
  prompt: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const StarterPrompt: React.FC<StarterPromptProps> = ({ prompt, onClick, icon }) => (
  <button
    onClick={onClick}
    className="bg-slate-700/50 hover:bg-slate-700 transition-colors text-left p-4 rounded-lg border border-slate-600 flex items-center gap-4"
  >
    {icon && <span className="text-cyan-400">{icon}</span>}
    <p className="text-slate-200 flex-1">{prompt}</p>
  </button>
);
