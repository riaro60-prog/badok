
import { GoogleGenAI, Type } from "@google/genai";
import { BoardState, Move } from "../types";
import { BOARD_SIZE } from "../constants";

export const getAIMove = async (board: BoardState): Promise<Move> => {
  // API 키를 안전하게 가져옵니다. (Vercel 등의 환경에서 process.env가 없을 경우 대비)
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Convert board to a more readable format for the AI
  const boardText = board.map(row => 
    row.map(cell => cell === null ? '0' : cell === 1 ? 'B' : 'W').join(' ')
  ).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      You are a grandmaster Omok (Gomoku) player. 
      The board size is ${BOARD_SIZE}x${BOARD_SIZE}.
      Rules: Connect 5 stones of your color (W for White) to win. 
      B is Black (your opponent), W is White (you), 0 is Empty.
      
      Current Board:
      ${boardText}
      
      Analyze the board, block opponent's patterns of 3 or 4, and create your own winning patterns.
      Return the best coordinates (row and col) for White's next move.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          row: {
            type: Type.INTEGER,
            description: "The row index (0-14)",
          },
          col: {
            type: Type.INTEGER,
            description: "The column index (0-14)",
          },
          reasoning: {
            type: Type.STRING,
            description: "A brief strategic explanation of the move",
          }
        },
        required: ["row", "col"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || '{}');
    // Basic validation to ensure coordinates are on board
    const row = Math.max(0, Math.min(BOARD_SIZE - 1, result.row ?? 0));
    const col = Math.max(0, Math.min(BOARD_SIZE - 1, result.col ?? 0));
    
    // Fallback if AI picks an occupied spot (simple scan)
    if (board[row][col] !== null) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c] === null) return { row: r, col: c };
        }
      }
    }

    return { row, col };
  } catch (error) {
    console.error("AI failed to provide valid move, falling back to random empty cell", error);
    // Last resort fallback
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null) return { row: r, col: c };
      }
    }
    return { row: 0, col: 0 };
  }
};
