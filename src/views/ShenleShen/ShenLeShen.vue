<template>
  <!-- First Loading -->
  <transition mode="in-out" name="opacity" tag="div" v-show="showLoading">
    <div class="loading">
      <div class="loading-content">
        <img
          class="propicon"
          :class="{ complete: lightIcon >= index }"
          v-for="(icon, index) in propIconlist"
          :key="icon"
          :src="'/img/icon/' + icon"
          alt="icon"
        />
      </div>
      <h1 class="loading-text">加载资源中...</h1>
    </div>
  </transition>
  <template v-if="!showLoading">
    <div
      class="xiaochu-warpper"
      :style="{ backgroundImage: `url(${assets.imgs['bk2.jpg']})` }"
    >
      <!-- card Area -->
      <transition-group
        mode="in-out"
        name="run"
        tag="div"
        class="card-warpper"
        :style="cardAreaStyle()"
      >
        <div
          v-for="card in layers"
          :key="card.id"
          :class="['card']"
          :style="card.style"
          :layer="card.layer"
          @click="pushWait(card)"
        >
          <img :src="assets.imgs[card.type]" alt="avatar" :class="['avatar']" />
        </div>
      </transition-group>
      <!-- PendingArea Area -->
      <transition-group
        mode="out-in"
        name="run"
        tag="div"
        class="pendingArea-warpper"
        :style="pendingAreaStyle"
      >
        <div
          v-for="card in pendingArea"
          :key="card.id"
          class="card-pending"
          :class="{
            'card-checked': card.checked,
          }"
          @click="pendingClick(card)"
          :style="{ width: card.style.width, height: card.style.height }"
        >
          <img :src="assets.imgs[card.type]" alt="avatar" :class="['avatar']" />
        </div>
      </transition-group>
      <!-- Props Area -->
    </div>
    <!-- Props Area -->
    <div class="props-warpper">
      <div class="prop" @click="restart()">重新开始</div>
      <div class="prop" @click="shuffleCard(layers)">刷新卡片</div>
      <div class="prop" @click="pushLayers()">送入卡场</div>
    </div>
    <!-- Panel Area -->
    <div v-if="panel.visible" class="panel-warpper">
      <div class="panel">
        <div class="title">
          {{ panel.title }}
        </div>
        <div class="action">
          <template v-for="action in panel.actions">
            <div
              class="btn"
              v-if="action.title === '重新开始'"
              @click="restart()"
            >
              {{ action.title }}
            </div>
            <div
              class="btn"
              v-if="action.title === '我还要整活！'"
              @click="panel.visible = false"
            >
              {{ action.title }}
            </div>
            <div class="btn" v-if="action.title === '分享'">
              {{ action.title }}
            </div>
            <div class="btn" v-if="action.title === '下一关'" @click="next()">
              {{ action.title }}
            </div>
          </template>
        </div>
      </div>
      <div
        class="next-img fade-in-fwd"
        :style="{ backgroundImage: `url(${assets.imgs['next.png']})` }"
        v-if="panel.title === '恭喜您，过关了！'"
      ></div>
      <div
        class="restart-img fade-in-fwd"
        :style="{ backgroundImage: `url(${assets.imgs['restart.png']})` }"
        v-if="panel.title === '已经被塞满啦！重新开始吧！'"
      ></div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid";
import {
  ref,
  toRefs,
  onMounted,
  StyleHTMLAttributes,
  nextTick,
  computed,
  watch,
  reactive,
} from "vue";
import _ from "lodash";
import {
  cardTypes,
  other,
  baseConfig,
  baseSounds,
  propIcons,
} from "../../config/baseData";
import http from "../../utils/http";
let layers = ref<Array<Card>>([]);
let pendingArea = ref<Array<Card>>([]);
let panel = ref({
  visible: false,
  title: "",
  actions: [{ title: "" }],
});
let showLoading = ref(true);
let loadProgress = ref();
let config = { ...baseConfig };
let propIconlist = ref(propIcons);
let assetsBase: Assets = {
  sounds: {},
  imgs: {},
  total: cardTypes.length + other.length + baseSounds.length,
};
let assets = reactive(assetsBase);
// 消除检测区域样式
const pendingAreaStyle = ref(setPendingAreaStyle());
window.addEventListener(
  "resize",
  () => {
    pendingAreaStyle.value = setPendingAreaStyle();
  },
  false
);
loadingAssets();
// 数据完成后
onMounted(() => {
  pushToTop(layers.value);
});

/* 场景初始化 */
async function loadingAssets() {
  //加载声音文件
  let sound_progress = 0;
  let img_pregress = 0;
  await Promise.all(
    baseSounds.map((sound) => {
      return http.get("/video/" + sound, { responseType: "blob" });
    })
  ).then((resList) => {
    resList.forEach((res, index) => {
      assets.sounds[baseSounds[index]] = URL.createObjectURL(res.data);
      sound_progress = index + 1;
      loadProgress.value = sound_progress;
    });
  });
  let imgs = [...cardTypes, ...other];
  await Promise.all(
    imgs.map((img) => {
      return http.get("/img/avatar/" + img, { responseType: "blob" });
    })
  ).then((resList) => {
    resList.forEach((res, index) => {
      assets.imgs[imgs[index]] = URL.createObjectURL(res.data);
      img_pregress = index + 1;
      loadProgress.value = sound_progress + img_pregress;
    });
  });
  //资源加载完毕后初始化卡片
  init()
}
// 加载资源动画
watch(loadProgress, () => {
  if (loadProgress.value >= assets.total) {
    showLoading.value = false;
  }
});
// 加载图标高亮
let lightIcon = computed(() => {
  return Math.floor((loadProgress.value / assets.total) * propIcons.length);
});
//初始化卡片
function init() {
  let cards=initCards()
  pushToTop(cards);
  layers.value=cards
}
//随机生成指定数量的方块，层数随机
function initCards() {
  let { xMax, yMax, count, layerMax, visibleLayer, length, unit } = config;
  let cards: Array<Card> = [];
  let imgs: Array<string> = [];
  for (let i = 0; i < count; i++) {
    imgs.push(cardTypes[_.random(cardTypes.length - 1)]);
  }
  let imgsShuffle = _.shuffle([...imgs, ...imgs, ...imgs]);
  for (let i = 0; i < count * 3; i++) {
    cards.push(buildCard({ type: imgsShuffle[i] }));
  }
  cards = cards.sort((a, b) => b.layer - a.layer);
  let top = cards.filter((item) => item.layer === config.layerMax);
  top.forEach((card) => {
    let hascollide = top.some((one) => {
      let rect1 = {
        x: card.x * card.length,
        y: card.y * card.length,
        width: card.length * 2,
        height: card.length * 2,
      };
      let rect2 = {
        x: one.x * one.length,
        y: one.y * one.length,
        width: one.length * 2,
        height: one.length * 2,
      };
      return collide(rect1, rect2);
    });
    if (hascollide) {
      card.layer--;
      card.style = setCardStyle(card);
    }
  });
  return cards;
}
// 创建单个卡片
function buildCard(options: any) {
  let { xMax, yMax, count, layerMax, visibleLayer, length, unit } = config;
  let {
    id = nanoid(),
    x = Math.round(Math.random() * xMax),
    y = Math.round(Math.random() * yMax),
    type = "",
    layer = _.random(layerMax),
  } = options;
  return {
    id: id,
    x: x,
    y: y,
    type: type,
    layer: layer,
    length: length,
    style: setCardStyle({ x, y, layer }),
    remove: false,
    checked: false,
  };
}
// 卡片区域样式
function cardAreaStyle() {
  let style = {
    // width:(config.waitCardMax-1) * config.length * 2 + 10 + config.unit,
    width: (config.xMax + 2) * config.length + config.unit,
    height: (config.yMax + 2) * config.length + config.unit,
  };
  return style;
}
//固定宽度卡片样式
function setCardStyle(card: any) {
  let { layerMax, length, visibleLayer, unit } = config;
  return {
    left: card.x * length + config.unit,
    top: card.y * length + config.unit,
    width: length * 2 + config.unit,
    height: length * 2 + config.unit,
    zIndex: card.layer,
    "--Black":
      (layerMax - card.layer) / layerMax < 0.5
        ? (layerMax - card.layer) / layerMax
        : 0.5,
    "--CardLength": length * 2 + unit,
    opacity: card.layer < visibleLayer,
  };
}



/* 系统功能 */

//推到等待区域
function pushWait(card: Card) {
  let { layerMax } = config;
  if (card.layer === layerMax) {
    if (pendingArea.value.length < config.waitCardMax) {
      soundPlay("Genshin Impact [Balloon].wav");
      pendingArea.value.push(card);
      layers.value = layers.value.filter((item) => item.id !== card.id);
    } else {
      soundPlay("Genshin Impact [CharacterDie].wav");
      panel.value.title = "已经被塞满啦！重新开始吧！";
      panel.value.actions = [{ title: "重新开始" }, { title: "我还要整活！" }];
      panel.value.visible = true;
    }
    nextTick(() => {
    pushToTop(layers.value); //将未被覆盖的卡片置顶
    checkpendingArea();
  });
  }

}
//将未被顶层遮挡的卡片置顶
function pushToTop(layers: Array<Card>) {
  for (let card of layers) {
    let layerTop = layers.filter((item) => item.layer === config.layerMax);
    if (card.layer === config.layerMax) {
      continue;
    } else {
      let hascollide = layerTop.some((one) => {
        let rect1 = {
          x: card.x * card.length,
          y: card.y * card.length,
          width: card.length * 2,
          height: card.length * 2,
        };
        let rect2 = {
          x: one.x * one.length,
          y: one.y * one.length,
          width: one.length * 2,
          height: one.length * 2,
        };
        return collide(rect1, rect2);
      });
      if (!hascollide) {
        card.layer = config.layerMax;
        card.style = setCardStyle(card);
      }
    }
  }
}
//检测等待区状态
function checkpendingArea() {
  let remove: Array<Card> = [];
  for (let i = 0; i < pendingArea.value.length; i++) {
    let card = pendingArea.value[i];
    let has3 = pendingArea.value.filter((item) => item.type === card.type);
    if (has3.length >= 3) {
      remove = has3.slice(0, 3);
    }
  }
  if (remove.length) {
    soundPlay("Genshin Impact [CharacterTalents].wav", 1);
    remove.forEach((card) => {
      card.remove = true;
    });
  }
  pendingArea.value = pendingArea.value.filter(
    (item) => !remove.some((card) => card.id === item.id)
  );
  if (pendingArea.value.length === 0 && layers.value.length === 0) {
    soundPlay("Genshin Impact [CommissionComplete].wav");
    panel.value.title = "恭喜您，过关了！";
    panel.value.actions = [{ title: "分享" }, { title: "下一关" }];
    panel.value.visible = true;
  }
}
//检测两矩形是否相交或相邻
function collide(react1: React, react2: React) {
  let maxX, maxY, minX, minY;
  maxX =
    react1.x + react1.width >= react2.x + react2.width
      ? react1.x + react1.width
      : react2.x + react2.width;
  maxY =
    react1.y + react1.height >= react2.y + react2.height
      ? react1.y + react1.height
      : react2.y + react2.height;
  minX = react1.x <= react2.x ? react1.x : react2.x;
  minY = react1.y <= react2.y ? react1.y : react2.y;
  if (
    maxX - minX < react1.width + react2.width &&
    maxY - minY < react1.height + react2.height
  ) {
    return true;
  } else {
    return false;
  }
}
// 检测等待区选中
function pendingClick(card: Card) {
  card.checked = !card.checked;
  if (card.checked) soundPlay("Genshin Impact [CharacterSwitch].wav");
  else soundPlay("Genshin Impact [ItemClose].wav");
}
/* 道具功能 */

// 打乱顺序
function shuffleCard(layers: Array<Card>) {
  soundPlay("Genshin Impact [Teleport].wav");
  let doCount = layers.length;
  while (doCount > 0) {
    let index0 = _.random(layers.length - 1);
    let index1 = _.random(layers.length - 1);
    let card0 = layers[index0];
    let card1 = layers[index1];
    let x0 = card0.x;
    let y0 = card0.y;
    let layer0 = card0.layer;
    let x1 = card1.x;
    let y1 = card1.y;
    let layer1 = card1.layer;
    card0.x = x1;
    card0.y = y1;
    card0.layer = layer1;
    card0.style = setCardStyle(card0);
    card1.x = x0;
    card1.y = y0;
    card1.layer = layer0;
    card1.style = setCardStyle(card1);
    doCount--;
  }
}
// 将等待区卡片丢入卡场
function pushLayers() {
  soundPlay("push2.mp3", 0.5);
  let selectCards = pendingArea.value.filter((card) => card.checked);
  selectCards.forEach((card) => {
    let hascollide = true;
    let count = 0; //防止无限生成
    while (hascollide && count < 100) {
      count++;
      let newCard = buildCard({ type: card.type });
      hascollide = layers.value.some((one) => {
        let rect1 = {
          x: newCard.x * newCard.length,
          y: newCard.y * newCard.length,
          width: newCard.length * 2,
          height: newCard.length * 2,
        };
        let rect2 = {
          x: one.x * one.length,
          y: one.y * one.length,
          width: one.length * 2,
          height: one.length * 2,
        };
        return collide(rect1, rect2);
      });
      if (!hascollide) {
        layers.value.push(newCard);
        pendingArea.value = pendingArea.value.filter((p) => p.id !== card.id);
      }
    }
  });
  nextTick(() => {
    pushToTop(layers.value);
  });
}
// 重新开始
function restart() {
  soundPlay("Genshin Impact [CommissionAccepted].wav");
  panel.value.visible = false;
  pendingArea.value.forEach((card) => {
    card.remove = true;
  });
  pendingArea.value = [];
  init()
}
// 下一关
function next() {
  soundPlay("Genshin Impact [Teleport].wav");
  panel.value.visible = false;
  pendingArea.value.forEach((card) => {
    card.remove = true;
  });
  pendingArea.value = [];
  // 提升游戏难度
  if (config.waitCardMax > 5) config.waitCardMax--; //等待区-1
  else if (config.visibleLayer > 2) config.visibleLayer--; //可见层数-1
  else if (config.layerMax < 10) config.layerMax++; //最大层数+1
  init()
}
// 播放音效
function soundPlay(sound: string, volume = 1) {
  let btnSound = new Audio(assets.sounds[sound]);
  btnSound.volume = volume;
  btnSound.play();
}
//移动端横屏竖屏适应
function setPendingAreaStyle() {
  let style = {};
  if (screen.orientation && screen.orientation.type) {
    switch (screen.orientation.type) {
      case "landscape-primary": {
        // 横屏正方向
        let height =
          (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit;
        style = {
          top: `calc((100vh - ${height})/2 )`,
          left: 0,
          flexFlow: "column nowrap",
          width: config.length * 2 + 1 + config.unit,
          height: height,
        };
        break;
      }
      case "landscape-secondary": {
        // 横屏反方向
        let height =
          (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit;
        style = {
          top: `calc((100vh - ${height})/2 )`,
          left: 0,
          flexFlow: "column nowrap",
          width: config.length * 2 + 1 + config.unit,
          height: height,
        };
        break;
      }
      case "portrait-secondary": {
        style = {
          bottom: "8vmin",
          width:
            (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit,
          height: config.length * 2 + 1 + config.unit,
        };
        break;
      } // 竖屏反方向
      case "portrait-primary": {
        // 竖屏正方向
        style = {
          bottom: "8vmin",
          width:
            (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit,
          height: config.length * 2 + 1 + config.unit,
        };
        break;
      }
      default: {
        style = {
          width:
            (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit,
          height: config.length * 2 + 1 + config.unit,
        };
      }
    }
  } else if (window.orientation) {
    switch (window.orientation) {
      case 90: {
        // 横屏正方向
        let height =
          (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit;
        style = {
          top: `calc((100vh - ${height})/2 )`,
          left: 0,
          flexFlow: "column nowrap",
          width: config.length * 2 + 1 + config.unit,
          height: height,
        };
        break;
      }
      case -90: {
        // 横屏反方向
        let height =
          (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit;
        style = {
          top: `calc((100vh - ${height})/2 )`,
          left: 0,
          flexFlow: "column nowrap",
          width: config.length * 2 + 1 + config.unit,
          height: height,
        };
        break;
      }
      case 0: {
        // 竖屏正方向
        style = {
          bottom: "8vmin",
          width:
            (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit,
          height: config.length * 2 + 1 + config.unit,
        };
        break;
      }
      case 180: {
        style = {
          bottom: 0,
          width:
            (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit,
          height: config.length * 2 + 1 + config.unit,
        };
        break;
      }

      default:
        style = {
          bottom: "8vmin",
          width:
            (config.waitCardMax - 1) * config.length * 2 + 10 + config.unit,
          height: config.length * 2 + 1 + config.unit,
        };
        break;
    }
  }
  return style;
}
/* 卡片动效 */
</script>
<style lang="less" scoped>
.loading {
  z-index: 1000;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  background: #f2f2f2;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  transition: all 1s;
  .loading-content {
    font-size: 10vmin;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    .propicon {
      width: 10vmin;
      height: 10vmin;
      filter: grayscale(1);
      transition: all 1s;
      &.complete {
        filter: grayscale(0);
      }
    }
  }
  .loading-text {
    margin-top: 2vmin;
    font-family: genshin;
    color: rgb(78, 78, 78);
    font-weight: bold;
    font-size: 3vmin;
  }
}
.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}
.run-enter-active,
.run-leave-active {
  transition: all 1s linear 0s;
}

.xiaochu-warpper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  // background-image: url("/img/bk2.jpg");
  background-size: 100% auto;
}

.card-warpper {
  margin-top: -14vmin;
  position: relative;

  .card {
    position: absolute;
    border-radius: 2vmin;
    border: 2px solid #dc8279;
    overflow: hidden;
    transition: all 0.6s;

    .avatar {
      height: 100%;
      width: 100%;
    }

    &::before {
      top: 0;
      left: 0;
      position: absolute;
      content: "";
      display: block;
      width: var(--CardLength);
      height: var(--CardLength);
      background-color: rgba(0, 0, 0, var(--Black));
      transition: all 0.6s;
    }
  }
}

.pendingArea-warpper {
  position: absolute;
  height: 14vmin;
  width: 100vmin;
  bottom: 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  background: #00000047;
  border: 4px solid #ffe0e096;

  .card-pending {
    cursor: pointer;
    border-radius: 1vmin;
    border: 2px solid #ff848475;
    overflow: hidden;

    &.card-checked {
      border: 2px solid #55cfff;
    }

    .avatar {
      height: 100%;
      width: 100%;
    }
  }
}

.props-warpper {
  height: 100vh;
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  .prop {
    user-select: none;
    cursor: pointer;
    height: 10vmin;
    width: 20vmin;
    text-align: center;
    line-height: 10vmin;
    margin: 3vmin;
    transition: all 0.6s;
    background-image: linear-gradient(60deg, #dc9797 30%, transparent);
    box-shadow: 0 0 8px 4px #ffc6c6;
    font-family: "genshin";
    font-size: 3vmin;
    color: #f3f3f3;

    &:hover {
      background-color: #55cfffc2;
    }
  }
}

.run-enter-from,
.run-leave-to {
  opacity: 0;
  transform: scale3d(0, 0, 0);
}

.run-enter-active,
.run-leave-active {
  transition: all 0.4s linear 0s;
}

// 移除的时候需要加上
.run-leave-active {
  position: absolute;
}

// 加上这个属性
.run-move {
  transition: all 0.4s linear 0s;
}

.panel-warpper {
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  background: #25252575;
}

.next-img {
  position: absolute;
  top: calc((100vh - 95vmin) / 2);
  left: calc((100vw - 40vmin) / 2);
  // margin-top: -55vmin;
  height: 40vmin;
  width: 40vmin;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.restart-img {
  position: absolute;
  top: calc((100vh - 95vmin) / 2);
  left: calc((100vw - 40vmin) / 2);
  height: 40vmin;
  width: 40vmin;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.panel {
  width: 80vmin;
  height: 40vmin;
  background: #f8b8d2cc;
  border: 4px solid #7991b591;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  transition: all 0.8s;

  .title {
    font-size: 6vmin;
    font-family: "hyfblxjt";
    color: #f6f6f6;
    text-align: center;
  }

  .action {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;

    .btn {
      cursor: pointer;
      padding: 1vmin 3vmin;
      background: #353535e6;
      font-size: 3vmin;
      font-family: "hyfblxjt";
      color: #fff;
      transition: all 0.4s;
      margin: 1vmin;

      &:hover {
        color: #dc9797;
      }
    }
  }
}
</style>

<style lang="less" scoped>
@media screen and (orientation: portrait) {
  .props-warpper {
    width: 100vw;
    height: 20vmin;
    position: absolute;
    top: 0;
    // bottom: 10vh;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
  }
}

@media screen and (orientation: landscape) {
  .props-warpper {
    width: 20vmin;
    height: 100vh;
    position: absolute;
    top: 0;
    right: 0;
    // bottom: 10vh;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
  }
}
</style>
