<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref, Ref, watchEffect } from "vue";
import Block from "./components/Block.vue";
import { GamePlay } from "./components/GamePlay";

let game = new GamePlay(10, 10);
watchEffect(() => {
  game.checkMatchResult();
  console.log("match result changed");
});
</script>

<template>
  <div class="h-screen m-auto flex justify-center items-center">
    <div>
      <div class="flex justify-center">
        <button @click="game.changeDev" class="btn-blue m-2">作弊</button>
        <button @click="game.resetMines" class="btn-blue m-2">重置</button>
      </div>
      <div class="text-center text-green-500">{{ game.matchResult }}</div>
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
