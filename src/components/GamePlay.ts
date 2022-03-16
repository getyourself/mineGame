import { BlockState } from "./../types/block";
import { ref, Ref, watchEffect } from "vue";
import { dev } from "../configs/dev";

const directions = [
  { x: 1, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
];

export class GamePlay {
  width: number;
  height: number;
  matchResult: Ref<String>;
  mineGenerated: boolean;
  state: Ref<BlockState[][]> = ref<BlockState[][]>([]);
  dev: Ref<boolean>;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.matchResult = ref("game start");
    this.mineGenerated = false;
    this.dev = dev;
    this.state = ref(
      Array.from({ length: this.width }, (_, y) =>
        Array.from(
          { length: this.height },
          (_, x): BlockState => ({
            x,
            y,
            ajacentMines: 0,
            revealed: false,
            flagged: false,
          })
        )
      )
    );
  }

  changeDev() {
    dev.value = !dev.value;
  }

  resetMines() {
    this.dev.value = false;
    this.matchResult.value = "game start";
    this.state.value = Array.from({ length: this.width }, (_, y) =>
      Array.from(
        { length: this.height },
        (_, x): BlockState => ({
          x,
          y,
          ajacentMines: 0,
          revealed: false,
          flagged: false,
        })
      )
    );
    this.mineGenerated = false;
  }

  generateMines(initialBlock: BlockState) {
    for (let row of this.state.value) {
      for (let col of row) {
        if (
          Math.abs(initialBlock.x - col.x) <= 1 ||
          Math.abs(initialBlock.y - col.y) <= 1
        )
          continue;
        col.mine = Math.random() < 0.2;
        col.ajacentMines = 0;
        col.revealed = false;
        col.flagged = false;
      }
    }
    this.mineGenerated = true;
    this.calculateAjacentMines();
  }

  calculateAjacentMines() {
    this.state.value.forEach((row, y) => {
      row.forEach((col, x) => {
        this.getSiblings(col).forEach((sibling) => {
          if (sibling.mine) col.ajacentMines++;
        });
      });
    });
  }

  getSiblings(cell: BlockState) {
    return directions
      .map((direction) => {
        if (
          direction.x + cell.x < 0 ||
          direction.x + cell.x >= this.width ||
          direction.y + cell.y < 0 ||
          direction.y + cell.y >= this.height
        )
          return undefined;
        let sibling: BlockState =
          this.state.value[cell.y + direction.y][cell.x + direction.x];
        return sibling;
      })
      .filter(Boolean) as Array<BlockState>;
  }

  expandZero(cell: BlockState) {
    if (cell.ajacentMines) return;
    let siblings = this.getSiblings(cell);
    if (siblings.every((s) => s.revealed)) return;
    //所有相连的0块直接显示
    siblings.forEach((sibling) => {
      if (!sibling.revealed) {
        sibling.revealed = true;
        this.expandZero(sibling);
      }
    });
  }

  onClick(item: BlockState) {
    if (item.mine) {
      this.matchResult.value = "you lose";
      dev.value = true;
      return;
    }
    if (!this.mineGenerated) {
      this.generateMines(item);
    }
    this.expandZero(item);
    item.revealed = true;
  }

  onRightClick(item: BlockState) {
    item.flagged = !item.flagged;
  }

  checkMatchResult() {
    let cells = this.state.value.flat();
    if (cells.some((cell) => !cell.revealed && !cell.flagged)) return;
    if (
      cells.every((cell) => {
        return cell.revealed || (cell.flagged && cell.mine);
      })
    ) {
      this.matchResult.value = "you win";
    } else {
      this.matchResult.value = "you lose";
    }
  }
}
