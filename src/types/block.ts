export interface BlockState {
  x: number;
  y: number;
  mine?: boolean;
  ajacentMines: number;
  revealed: boolean;
  flagged: boolean;
}
