
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
    <div className="relative p-4 bg-[#E3C193] rounded shadow-2xl border-[12px] border-[#8B4513] transition-all">
      <div className="absolute inset-0 pointer-events-none p-4">
        <div className="w-full h-full relative">
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <div 
              key={`v-${i}`}
              className="absolute bg-black opacity-40"
              style={{
                left: getLinePos(i),
                top: getLinePos(0),
                bottom: getLinePos(BOARD_SIZE - 1),
                width: '1px'
              }}
            />
          ))}
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <div 
              key={`h-${i}`}
              className="absolute bg-black opacity-40"
              style={{
                top: getLinePos(i),
                left: getLinePos(0),
                right: getLinePos(BOARD_SIZE - 1),
                height: '1px'
              }}
            />
          ))}
          {[3, 11, 7].flatMap(r => [3, 11, 7].map(c => (r === 7 && c !== 7) || (c === 7 && r !== 7) ? null : [r, c])).filter(p => p).map(([r, c], idx) => (
             <div 
              key={`hoshi-${idx}`}
              className="absolute bg-black/70 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
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
          width: 'min(90vw, 520px)',
          height: 'min(90vw, 520px)'
        }}
      >
        {board.map((row, rIdx) => 
          row.map((cell, cIdx) => (
            <button
              key={`${rIdx}-${cIdx}`}
              disabled={cell !== null || isThinking}
              onClick={() => onCellClick(rIdx, cIdx)}
              className="relative flex items-center justify-center hover:bg-black/5 rounded-none transition-colors group focus:outline-none"
              aria-label={`row ${rIdx} column ${cIdx}`}
            >
              <Stone 
                player={cell} 
                isLastMove={lastMove?.row === rIdx && lastMove?.col === cIdx} 
              />
              {cell === null && !isThinking && (
                <div className="hidden group-hover:block w-3 h-3 bg-black/20 rounded-full" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
