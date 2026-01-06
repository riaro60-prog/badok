
export enum Player {
  BLACK = 1,
  WHITE = 2
}

export type CellValue = Player | null;

export type BoardState = CellValue[][];

export interface Move {
  row: number;
  col: number;
}

export interface GameStatus {
  winner: Player | null;
  isDraw: boolean;
  isThinking: boolean;
  lastMove: Move | null;
}
