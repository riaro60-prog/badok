
import React, { useState, useEffect, useCallback } from 'react';
import { Player, BoardState, Move, GameStatus } from './types.ts';
import { createInitialBoard, checkWinner, isBoardFull } from './utils/gameLogic.ts';
import { getAIMove } from './services/geminiService.ts';
import Board from './components/Board.tsx';
import { RefreshCw, BrainCircuit, Trophy, User, Hash, Users, Cpu } from 'lucide-react';

type GameMode = 'AI' | 'PVP';

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.BLACK);
  const [gameMode, setGameMode] = useState<GameMode>('AI');
  const [status, setStatus] = useState<GameStatus>({
    winner: null,
    isDraw: false,
    isThinking: false,
    lastMove: null
  });

  const resetGame = (newMode?: GameMode) => {
    setBoard(createInitialBoard());
    setCurrentPlayer(Player.BLACK);
    if (newMode) setGameMode(newMode);
    setStatus({
      winner: null,
      isDraw: false,
      isThinking: false,
      lastMove: null
    });
  };

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (board[row][col] || status.winner || status.isDraw || status.isThinking) return;
    if (gameMode === 'AI' && currentPlayer === Player.WHITE) return;

    const newBoard = board.map((r, ri) => 
      r.map((c, ci) => (ri === row && ci === col ? currentPlayer : c))
    );
    const move = { row, col };
    setBoard(newBoard);
    setStatus(prev => ({ ...prev, lastMove: move }));

    const winner = checkWinner(newBoard, move);
    if (winner) {
      setStatus(prev => ({ ...prev, winner }));
      return;
    }

    if (isBoardFull(newBoard)) {
      setStatus(prev => ({ ...prev, isDraw: true }));
      return;
    }

    setCurrentPlayer(currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK);
  }, [board, currentPlayer, status, gameMode]);

  useEffect(() => {
    const triggerAI = async () => {
      if (gameMode === 'AI' && currentPlayer === Player.WHITE && !status.winner && !status.isDraw) {
        setStatus(prev => ({ ...prev, isThinking: true }));
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
          const aiMove = await getAIMove(board);
          const newBoard = board.map((r, ri) => 
            r.map((c, ci) => (ri === aiMove.row && ci === aiMove.col ? Player.WHITE : c))
          );
          
          setBoard(newBoard);
          setStatus(prev => ({ ...prev, lastMove: aiMove, isThinking: false }));

          const winner = checkWinner(newBoard, aiMove);
          if (winner) {
            setStatus(prev => ({ ...prev, winner }));
          } else if (isBoardFull(newBoard)) {
            setStatus(prev => ({ ...prev, isDraw: true }));
          } else {
            setCurrentPlayer(Player.BLACK);
          }
        } catch (error) {
          console.error("AI turn failed", error);
          setStatus(prev => ({ ...prev, isThinking: false }));
        }
      }
    };
    triggerAI();
  }, [currentPlayer, board, status.winner, status.isDraw, gameMode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f0f2f5] text-slate-800">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2 flex items-center justify-center gap-3">
          <Hash className="text-amber-700" size={36} />
          Zen Omok
        </h1>
        <p className="text-slate-500 font-light italic">
          {gameMode === 'AI' ? 'Challenge Gemini 3 Pro' : 'Offline 1vs1 Mode'}
        </p>
      </header>

      <main className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="w-full max-w-xs space-y-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2">
            <button 
              onClick={() => resetGame('AI')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${gameMode === 'AI' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
            >
              <Cpu size={18} />
              <span className="text-sm font-medium">AI 대결</span>
            </button>
            <button 
              onClick={() => resetGame('PVP')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${gameMode === 'PVP' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
            >
              <Users size={18} />
              <span className="text-sm font-medium">2인 대결</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
              <User size={20} className="text-slate-400" /> {status.winner ? '결과' : '진행 상태'}
            </h2>
            
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${currentPlayer === Player.BLACK ? 'bg-slate-100 ring-1 ring-slate-300' : 'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-black shadow-inner" />
                  <span className="font-medium text-sm">{gameMode === 'AI' ? '나 (흑)' : '1P (흑)'}</span>
                </div>
                {currentPlayer === Player.BLACK && !status.winner && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${currentPlayer === Player.WHITE ? 'bg-slate-100 ring-1 ring-slate-300' : 'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow-sm" />
                  <span className="font-medium text-sm">{gameMode === 'AI' ? 'AI (백)' : '2P (백)'}</span>
                </div>
                {currentPlayer === Player.WHITE && !status.winner && (
                  gameMode === 'AI' ? (
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )
                )}
              </div>
            </div>

            {status.winner && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col items-center animate-bounce">
                <Trophy className="text-amber-500 mb-2" size={32} />
                <span className="font-bold text-amber-800 text-xl text-center">
                  {status.winner === Player.BLACK 
                    ? (gameMode === 'AI' ? '당신의 승리!' : '1P 승리!') 
                    : (gameMode === 'AI' ? 'AI의 승리!' : '2P 승리!')}
                </span>
              </div>
            )}

            {status.isDraw && (
              <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-300 flex flex-col items-center">
                <span className="font-bold text-slate-700 text-xl">무승부!</span>
              </div>
            )}
          </div>

          <button
            onClick={() => resetGame()}
            className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 font-semibold group"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            다시 시작
          </button>
        </div>

        <div className="relative group">
          <Board 
            board={board} 
            onCellClick={handleCellClick} 
            lastMove={status.lastMove}
            isThinking={status.isThinking}
          />
          {status.isThinking && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center rounded pointer-events-none">
              <div className="bg-white/90 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-indigo-100">
                <BrainCircuit className="text-indigo-600 animate-pulse" />
                <span className="font-medium text-indigo-900">AI 분석 중...</span>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-full max-w-xs p-6 bg-white rounded-2xl shadow-sm border border-slate-200 self-stretch">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">도움말</h2>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">●</span>
              <span><strong>{gameMode === 'AI' ? 'AI 모드' : '2인 모드'}</strong>로 플레이 중입니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">●</span>
              <span>가로, 세로, 대각선 중 하나라도 5개의 알을 먼저 이으면 승리합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">●</span>
              <span>{gameMode === 'AI' ? 'AI는 상당히 똑똑하므로 방심하지 마세요!' : '친구와 번갈아가며 한 기기에서 대결하세요.'}</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-slate-400 text-sm font-light">
        © 2024 Zen Omok • {gameMode === 'AI' ? 'AI Powered' : 'Local PvP Mode'}
      </footer>
    </div>
  );
};

export default App;
