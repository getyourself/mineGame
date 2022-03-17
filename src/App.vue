<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Block from "./components/Block.vue";
import { GamePlay } from "./components/GamePlay";
import { onDeactivated, ref, computed, watchEffect } from "vue";

let game = new GamePlay(10, 10, 10);
let time = ref(0);
let timer = setInterval(() => {
  time.value = Math.round((Date.now() - game.time) / 1000);
}, 1000);

let remaining = computed(() => {
  return (
    game.mines -
    game.cells.reduce((accu, item) => {
      return (accu += item.flagged ? 1 : 0);
    }, 0)
  );
});

onDeactivated(() => {
  clearInterval(timer);
});

watchEffect(() => {
  game.checkMatchResult();
  if (game.win) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="h-screen m-auto flex justify-center items-center overflow-hidden">
    <div class="overflow-auto">
      <div class="flex justify-center">
        <button @click="game.changeDev" class="btn-blue m-2">作弊</button>
        <button @click="game.resetMines()" class="btn-blue m-2">重置</button>
        <button @click="game.resetMines(16, 16, 23)" class="btn-blue m-2">
          困难
        </button>
        <button @click="game.resetMines(10, 10, 5)" class="btn-blue m-2">
          中等
        </button>
        <button @click="game.resetMines(6, 6, 2)" class="btn-blue m-2">
          简单
        </button>
      </div>
      <div class="text-center flex justify-center items-center">
        <div>⌚{{ time }}</div>
        <div>☀{{ remaining }}</div>
      </div>
      <!--使用类之后需要注意响应式数据的value-->
      <div v-for="(row, y) in game.state.value" :key="y" class="flex mx-auto">
        <Block
          v-for="(cell, x) in row"
          :key="x"
          :cell="cell"
          :dev="game.dev.value"
          @click="game.onClick(cell)"
          @contextmenu="game.onRightClick(cell)"
        ></Block>
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
