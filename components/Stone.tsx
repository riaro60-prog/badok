
import React from 'react';
import { Player } from '../types.ts';

interface StoneProps {
  player: Player | null;
  isLastMove?: boolean;
}

const Stone: React.FC<StoneProps> = ({ player, isLastMove }) => {
  if (!player) return null;

  return (
    <div className={`
      relative w-5/6 h-5/6 rounded-full shadow-[0_6px_0_0_rgba(0,0,0,0.1)] transition-all duration-500 transform scale-100 animate-[pop_0.3s_ease-out]
      ${player === Player.BLACK 
        ? 'bg-indigo-900 bg-gradient-to-br from-indigo-800 to-slate-900 border-2 border-indigo-950' 
        : 'bg-white bg-gradient-to-br from-white to-pink-50 border-2 border-pink-100'}
    `}>
      {/* Shine Effect */}
      <div className={`
        absolute top-1.5 left-2 w-3 h-2 rounded-full blur-[1px]
        ${player === Player.BLACK ? 'bg-white/20' : 'bg-pink-100/80'}
      `} />
      
      {isLastMove && (
        <div className={`
          absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
          ${player === Player.BLACK ? 'bg-indigo-400' : 'bg-pink-400'}
          animate-bounce shadow-md
        `}>
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Stone;
