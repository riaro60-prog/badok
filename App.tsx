
import React, { useState, useEffect, useCallback } from 'react';
import { Player, BoardState, Move, GameStatus } from './types.ts';
import { createInitialBoard, checkWinner, isBoardFull } from './utils/gameLogic.ts';
import { getAIMove } from './services/geminiService.ts';
import Board from './components/Board.tsx';
import { RefreshCw, BrainCircuit, Trophy, User, Heart, Users, Cpu, Sparkles, Star } from 'lucide-react';

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
        await new Promise(resolve => setTimeout(resolve, 1000));

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 select-none">
      <header className="mb-8 text-center animate-soft-bounce">
        <h1 className="text-5xl font-cute font-bold tracking-tight text-pink-500 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-400 fill-yellow-400" size={32} />
          달콤 오목
          <Heart className="text-pink-400 fill-pink-400" size={32} />
        </h1>
        <p className="text-slate-400 font-medium tracking-wide">
          {gameMode === 'AI' ? '똑똑한 제미니와 한판!' : '친구와 도란도란 대결'}
        </p>
      </header>

      <main className="flex flex-col lg:flex-row gap-8 items-center max-w-6xl w-full justify-center">
        {/* Left Side: Game Info */}
        <div className="w-full max-w-xs space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-[2rem] shadow-xl shadow-pink-100 border-4 border-pink-100 flex gap-2">
            <button 
              onClick={() => resetGame('AI')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-3xl transition-all duration-300 ${gameMode === 'AI' ? 'bg-pink-400 text-white shadow-lg' : 'hover:bg-pink-50 text-pink-300'}`}
            >
              <Cpu size={18} />
              <span className="font-bold font-cute text-lg">AI 친구</span>
            </button>
            <button 
              onClick={() => resetGame('PVP')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-3xl transition-all duration-300 ${gameMode === 'PVP' ? 'bg-indigo-400 text-white shadow-lg' : 'hover:bg-indigo-50 text-indigo-300'}`}
            >
              <Users size={18} />
              <span className="font-bold font-cute text-lg">둘이서</span>
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl shadow-pink-100 border-2 border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Star size={80} className="fill-pink-200 text-pink-200" />
            </div>
            
            <h2 className="text-xl font-cute font-bold mb-6 text-slate-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-pink-500" />
              </div>
              플레이 정보
            </h2>
            
            <div className="space-y-4 relative z-10">
              <div className={`flex items-center justify-between p-4 rounded-3xl transition-all duration-500 ${currentPlayer === Player.BLACK ? 'bg-indigo-50 border-2 border-indigo-200 shadow-inner' : 'opacity-40 scale-95'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-900 shadow-lg border-2 border-indigo-700 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white/20 blur-[1px] translate-x-1 -translate-y-1" />
                  </div>
                  <span className="font-bold text-indigo-900">{gameMode === 'AI' ? '나 (흑)' : '1P (흑)'}</span>
                </div>
                {currentPlayer === Player.BLACK && !status.winner && <Heart className="text-indigo-400 fill-indigo-400 animate-pulse" size={20} />}
              </div>

              <div className={`flex items-center justify-between p-4 rounded-3xl transition-all duration-500 ${currentPlayer === Player.WHITE ? 'bg-pink-50 border-2 border-pink-200 shadow-inner' : 'opacity-40 scale-95'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-pink-100 flex items-center justify-center overflow-hidden">
                    <div className="w-4 h-4 rounded-full bg-pink-50/50 blur-[2px] translate-x-1 -translate-y-1" />
                  </div>
                  <span className="font-bold text-pink-600">{gameMode === 'AI' ? '제미니 (백)' : '2P (백)'}</span>
                </div>
                {currentPlayer === Player.WHITE && !status.winner && (
                  <div className="flex gap-1 animate-bounce">
                    <span className="w-2 h-2 bg-pink-400 rounded-full" />
                    <span className="w-2 h-2 bg-pink-400 rounded-full opacity-60" />
                  </div>
                )}
              </div>
            </div>

            {status.winner && (
              <div className="mt-8 p-5 bg-yellow-50 rounded-[2rem] border-4 border-dashed border-yellow-200 flex flex-col items-center animate-bounce shadow-xl shadow-yellow-100">
                <Trophy className="text-yellow-500 mb-2 drop-shadow-md" size={48} />
                <span className="font-cute font-bold text-yellow-800 text-2xl text-center leading-tight">
                  축하해요!<br/>
                  {status.winner === Player.BLACK 
                    ? (gameMode === 'AI' ? '당신이 이겼어요!' : '1P가 이겼어요!') 
                    : (gameMode === 'AI' ? 'AI가 이겼어요!' : '2P가 이겼어요!')}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => resetGame()}
            className="w-full py-5 px-6 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-[2rem] shadow-xl hover:shadow-pink-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 font-bold text-xl font-cute group border-b-8 border-rose-600"
          >
            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
            다시 할래요!
          </button>
        </div>

        {/* Center: Board */}
        <div className="relative p-2 md:p-6 bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-white/60 shadow-2xl">
          <Board 
            board={board} 
            onCellClick={handleCellClick} 
            lastMove={status.lastMove}
            isThinking={status.isThinking}
          />
          {status.isThinking && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center rounded-[3rem] pointer-events-none z-50">
              <div className="bg-white px-8 py-5 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 border-4 border-indigo-100 animate-soft-bounce">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
                </div>
                <span className="font-cute font-bold text-indigo-900 text-xl">제미니가 고민 중...</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Tips */}
        <div className="hidden xl:block w-full max-w-[200px] p-6 bg-white/60 rounded-[2rem] self-stretch border-2 border-white">
          <h2 className="text-xl font-cute font-bold mb-6 text-pink-500 text-center">꿀팁 ✨</h2>
          <div className="space-y-6 text-sm font-medium text-slate-500 leading-relaxed">
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm italic">"공격보다 수비가 중요할 때가 있어요!"</div>
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm italic">"대각선을 잘 살피면 승리의 길이 보인답니다."</div>
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm italic">"3-3 금수가 없으니 마음껏 둬보세요!"</div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-pink-300 font-cute text-xl flex items-center gap-2">
        <Heart size={16} className="fill-pink-200" /> 달콤한 오목 세상 <Heart size={16} className="fill-pink-200" />
      </footer>
    </div>
  );
};

export default App;
