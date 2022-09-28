<template>
  <div>
    <video id="v1" autoplay loop muted class="audio">
    <source  src="/video/404.mp4">
    </video>
  </div>
  <router-link class="back-home" to="/sls">返回首页</router-link>
</template>

<script setup lang='ts'>
import { ref,toRefs,onMounted} from 'vue'

let a=ref(0)


</script>
<style lang='less' scoped>
.audio{
  height: 100vh;
  width: 100vw;
}
.back-home{
  cursor: pointer;
  position: absolute;
  top: calc((100vh - 15vmin)/2);
  left: calc((100vw -  40vmin)/2);
  height: 15vmin;
  width: 40vmin;
  text-align: center;
  line-height: 15vmin;
  background: rgba(51, 51, 51, 0.425);
  color: #fff;
  font-family: 'genshin';
  font-size: 3vmin;
  transition: all .4s;
  &:hover{
    background: rgba(51, 51, 51, 0.89);
  }
}
</style>