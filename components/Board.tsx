
import React from 'react';
import { BoardState, Move } from '../types.ts';
import Stone from './Stone.tsx';
import { BOARD_SIZE } from '../constants.ts';

interface BoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  lastMove: Move | null;
  isThinking: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, lastMove, isThinking }) => {
  const getLinePos = (index: number) => `${((index + 0.5) / BOARD_SIZE) * 100}%`;

  return (
    <div className="relative p-6 bg-[#FFF9ED] rounded-[2.5rem] shadow-2xl border-[14px] border-[#FBD38D] transition-all overflow-hidden">
      {/* Wood Texture / Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="absolute inset-0 pointer-events-none p-6">
        <div className="w-full h-full relative">
          {/* Grid Lines */}
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <div 
              key={`v-${i}`}
              className="absolute bg-orange-200"
              style={{
                left: getLinePos(i),
                top: getLinePos(0),
                bottom: getLinePos(BOARD_SIZE - 1),
                width: '2px'
              }}
            />
          ))}
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <div 
              key={`h-${i}`}
              className="absolute bg-orange-200"
              style={{
                top: getLinePos(i),
                left: getLinePos(0),
                right: getLinePos(BOARD_SIZE - 1),
                height: '2px'
              }}
            />
          ))}
          
          {/* Hoshi Points */}
          {[3, 11, 7].flatMap(r => [3, 11, 7].map(c => (r === 7 && c !== 7) || (c === 7 && r !== 7) ? null : [r, c])).filter(p => p).map(([r, c], idx) => (
             <div 
              key={`hoshi-${idx}`}
              className="absolute bg-orange-300 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
              style={{
                top: getLinePos(r!),
                left: getLinePos(c!)
              }}
             />
          ))}
        </div>
      </div>

      <div 
        className="grid gap-0 relative z-10" 
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: 'min(88vw, 540px)',
          height: 'min(88vw, 540px)'
        }}
      >
        {board.map((row, rIdx) => 
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              disabled={cell !== null || isThinking}
              onClick={() => onCellClick(rIdx, cIdx)}
              className="relative flex items-center justify-center hover:bg-pink-100/30 rounded-full transition-all duration-300 group focus:outline-none"
              aria-label={`row ${rIdx} column ${cIdx}`}
            >
              <Stone 
                player={cell} 
                isLastMove={lastMove?.row === rIdx && lastMove?.col === cIdx} 
              />
              {cell === null && !isThinking && (
                <div className="hidden group-hover:block w-4 h-4 bg-pink-200/50 rounded-full animate-ping" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
