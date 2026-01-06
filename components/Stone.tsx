
import React from 'react';
import { Player } from '../types';

interface StoneProps {
  player: Player | null;
  isLastMove?: boolean;
}

const Stone: React.FC<StoneProps> = ({ player, isLastMove }) => {
  if (!player) return null;

  return (
    <div className={`
      relative w-5/6 h-5/6 rounded-full shadow-lg transition-all duration-300 transform scale-100
      ${player === Player.BLACK 
        ? 'bg-neutral-800 bg-gradient-to-br from-neutral-700 to-black' 
        : 'bg-white bg-gradient-to-br from-neutral-100 to-neutral-300'}
    `}>
      {isLastMove && (
        <div className={`
          absolute inset-0 m-auto w-2 h-2 rounded-full 
          ${player === Player.BLACK ? 'bg-red-400' : 'bg-red-500'}
          animate-ping
        `} />
      )}
    </div>
  );
};

export default Stone;
