<template>
  <div
    :class="[
      'border',
      'h-10',
      'w-10',
      'hover:bg-gray-300/10',
      'flex',
      'items-center',
      'justify-center',
      'font-medium',
      'gap-1',
      'text-center',
      getCellClasses(cell),
    ]"
    @click="onClick(cell)"
    @contextmenu.prevent="onRightClick(cell)"
  >
    <template v-if="cell.flagged && !cell.revealed && !dev">
      {{ "🚩" }}
    </template>
    <template v-else-if="cell.revealed || dev">
      {{ cell.mine ? "💣" : cell.ajacentMines }}
    </template>
  </div>
</template>

<script setup lang="ts">
import { BlockState } from "../types/block";
const emit = defineEmits(["click", "contextmenu"]);
const props = defineProps<{
  cell: BlockState;
  dev: Boolean;
}>();
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
    if (cell.revealed || props.dev) {
      return "bg-red-300";
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
  emit("click", item);
}

function onRightClick(item: BlockState) {
  emit("contextmenu", item);
}
</script>
<style scoped></style>
