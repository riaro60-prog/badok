
import { BoardState, Player, Move } from "../types";
import { BOARD_SIZE, WIN_CONDITION } from "../constants";

export const createInitialBoard = (): BoardState => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
};

export const checkWinner = (board: BoardState, lastMove: Move): Player | null => {
  const { row, col } = lastMove;
  const player = board[row][col];
  if (!player) return null;

  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal (top-left to bottom-right)
    [1, -1], // Diagonal (top-right to bottom-left)
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check forward
    for (let i = 1; i < WIN_CONDITION; i++) {
      const nr = row + dr * i;
      const nc = col + dc * i;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
        count++;
      } else {
        break;
      }
    }

    // Check backward
    for (let i = 1; i < WIN_CONDITION; i++) {
      const nr = row - dr * i;
      const nc = col - dc * i;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
        count++;
      } else {
        break;
      }
    }

    if (count >= WIN_CONDITION) return player;
  }

  return null;
};

export const isBoardFull = (board: BoardState): boolean => {
  return board.every(row => row.every(cell => cell !== null));
};
