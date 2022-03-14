<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { reactive } from "vue";
interface BlockState {
  x: number;
  y: number;
  mine?: boolean;
  ajacentMines: number;
  revealed: boolean;
  flagged: boolean;
}
const WIDTH = 5;
const HEIGHT = 5;
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
let dev = true;
let mineGenerated = false;
const state = reactive(
  Array.from({ length: WIDTH }, (_, y) =>
    Array.from(
      { length: HEIGHT },
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

function generateMines(initialBlock: BlockState) {
  for (let row of state) {
    for (let col of row) {
      if (
        Math.abs(initialBlock.x - col.x) <= 1 ||
        Math.abs(initialBlock.y - col.y) <= 1
      )
        continue;
      col.mine = Math.random() < 0.3;
      col.ajacentMines = 0;
      col.revealed = false;
      col.flagged = false;
    }
  }
  console.log("generated");
  mineGenerated = true;
  calculateAjacentMines();
}

function calculateAjacentMines() {
  state.forEach((row, y) => {
    row.forEach((col, x) => {
      getSiblings(col).forEach((sibling) => {
        if (sibling.mine) col.ajacentMines++;
      });
    });
  });
}

function getSiblings(cell: BlockState) {
  return directions
    .map((direction) => {
      if (
        direction.x + cell.x < 0 ||
        direction.x + cell.x >= WIDTH ||
        direction.y + cell.y < 0 ||
        direction.y + cell.y >= HEIGHT
      )
        return undefined;
      let sibling: BlockState =
        state[cell.y + direction.y][cell.x + direction.x];
      return sibling;
    })
    .filter(Boolean) as Array<BlockState>;
}

function expandZero(cell: BlockState) {
  if (cell.revealed || cell.ajacentMines) return;
  getSiblings(cell).forEach((sibling) => {
    console.log("every", sibling);
    sibling.revealed = true;
    expandZero(sibling);
  });
}

function getCellClasses(cell: BlockState) {
  const degreeOfDanger = [
    "text-transparent",
    "text-blue-500",
    "text-green-500",
    "text-yellow-500",
    "text-orange-500",
    "text-red-500",
    "text-purple-500",
    "text-pink-500",
    "text-teal-500",
  ];
  if (cell.mine) {
    if (cell.revealed) {
      return "bg-red-500";
    } else {
      return "bg-gray-500/10";
    }
  } else {
    if (cell.revealed) {
      return degreeOfDanger[cell.ajacentMines];
    } else {
      return "bg-gray-500/10";
    }
  }
}

function onClick(item: BlockState) {
  if (item.mine) {
    alert("you lose");
    generateMines(item);
    return;
  }
  if (!mineGenerated) {
    generateMines(item);
  }
  expandZero(item);
  item.revealed = true;
  checkMatchResult();
}

function onRightClick(item: BlockState) {
  item.flagged = !item.flagged;
  checkMatchResult();
}

function checkMatchResult() {
  let cells = state.flat();
  if (cells.some((cell) => !cell.revealed && !cell.flagged)) return;
  if (
    cells.every((cell) => {
      return cell.revealed || (cell.flagged && cell.mine);
    })
  ) {
    alert("you win");
  } else {
    alert("you lose");
  }
}
</script>

<template>
  <div class="h-screen m-auto flex justify-center items-center">
    <div>
      <div v-for="(row, y) in state" :key="y" class="flex mx-auto">
        <div
          :class="[
            'border',
            'h-10',
            'w-10',
            'hover:bg-gray-300/10',
            'flex',
            'items-center',
            'justify-center',
            'gap-1',
            'text-center',
            getCellClasses(cell),
          ]"
          v-for="(cell, x) in row"
          :key="x"
          @click="onClick(cell)"
          @contextmenu.prevent="onRightClick(cell)"
        >
          <template v-if="cell.flagged && !cell.revealed">
            {{ "🚩" }}
          </template>
          <template v-else-if="cell.revealed || dev">
            {{ cell.mine ? "💣" : cell.ajacentMines }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
.text-red {
  color: red;
}
.text-gray {
  color: gray;
}
</style>
