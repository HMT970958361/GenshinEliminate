// 卡片属性
interface Card {
    id: string;
    x: number;
    y: number;
    type: string;
    layer: number;
    length: number;
    style?: any;
    remove?: boolean;
    checked?: boolean;
  }
// 矩形属性
interface React {
    x: number;
    y: number;
    width: number;
    height: number;
  }
// 游戏配置属性
  interface Config {
    xMax: number; //行总数
    yMax: number; //列总数
    imgList: Array<string>; //卡片图案集
    count: number; //生成数量
    length: number;
    layerMax: number; //最大层数
    visibleLayer?: number;
    cardLength?: number;
    waitCardMax?: number;
}
// 弹窗属性
interface Panel{
    visible:boolean
    title: string
    actions:Array<{
        title:string
    }>
}
// 资源属性
interface Assets{
  sounds:{
    [key: string]: any;
  }
  imgs:{
    [key: string]: any;
  }
  total:number
  
}