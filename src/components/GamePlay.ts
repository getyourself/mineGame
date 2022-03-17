import { BlockState } from "./../types/block";
import { ref, Ref, watchEffect } from "vue";
import { dev } from "../configs/dev";
import confetti from "canvas-confetti";

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

enum MatchResult {
  FAIL,
  SUCCESS,
  PENDING,
}

export class GamePlay {
  width: number;
  height: number;
  matchResult: Ref<MatchResult>;
  mineGenerated: boolean;
  state: Ref<BlockState[][]> = ref<BlockState[][]>([]);
  dev: Ref<boolean>;
  mines: number;
  time: number;
  constructor(width: number, height: number, mines: number) {
    this.width = width;
    this.height = height;
    this.matchResult = ref(MatchResult.PENDING);
    this.mineGenerated = false;
    this.dev = dev;
    this.mines = mines;
    this.time = Date.now();
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

  get cells() {
    return this.state.value.flat();
  }

  get win() {
    return this.matchResult.value === MatchResult.SUCCESS;
  }

  changeDev() {
    dev.value = !dev.value;
  }

  resetMines(width?: number, height?: number, mines?: number) {
    this.width = width || this.width;
    this.height = height || this.height;
    this.mines = mines || this.mines;
    this.dev.value = false;
    this.matchResult.value = MatchResult.PENDING;
    this.time = Date.now();
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
    function getRangeRandom(x: number, y: number) {
      return Math.round(Math.random() * (x - y) + y);
    }
    const setMine = () => {
      const x = getRangeRandom(0, this.width - 1);
      const y = getRangeRandom(0, this.height - 1);
      const cell = this.state.value[y][x];
      if (
        cell.mine ||
        Math.abs(initialBlock.x - cell.x) <= 1 ||
        Math.abs(initialBlock.y - cell.y) <= 1
      ) {
        return false;
      }
      cell.mine = true;
      return true;
    };
    //根据地雷数量而不是概率设置地雷
    Array.from({ length: this.mines }).forEach((_) => {
      //存在随机两次为同一个的情况，需要重新设置
      while (!setMine()) {}
    });
    // for (let row of this.state.value) {
    //   for (let col of row) {
    //     if (
    //       Math.abs(initialBlock.x - col.x) <= 1 ||
    //       Math.abs(initialBlock.y - col.y) <= 1
    //     )
    //       continue;
    //     col.mine = Math.random() < 0.2;
    //     col.ajacentMines = 0;
    //     col.revealed = false;
    //     col.flagged = false;
    //   }
    // }
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
      this.matchResult.value = MatchResult.FAIL;
      dev.value = true;
      return;
    }
    if (!this.mineGenerated) {
      this.generateMines(item);
    }
    this.expandZero(item);
    item.revealed = true;
    item.flagged = false;
  }

  onRightClick(item: BlockState) {
    item.flagged = !item.flagged;
  }

  checkMatchResult() {
    let cells = this.state.value.flat();
    //收集依赖需要遍历每条数据
    if (
      cells.every((cell) => {
        return cell.revealed || cell.flagged;
      })
    ) {
      if (
        cells.every((cell) => {
          return cell.revealed || (cell.flagged && cell.mine);
        })
      ) {
        this.matchResult.value = MatchResult.SUCCESS;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        this.matchResult.value = MatchResult.FAIL;
      }
    }
  }
}
