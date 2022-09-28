//import { svgBuilder } from './src/components/base/svgicon/svgBuilder'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//import legacy from '@vitejs/plugin-legacy'
// https://vitejs.dev/config/
export default defineConfig({
  //基础配置
  //root:'./',
  //base: '/hmt-system/',
  // publicDir:'',
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '~@', replacement: resolve(__dirname, 'public') }
    ],
    extensions: ['.js', '.ts', '.json']
  },
  define: {
    'process.env': {
      'BASE_API':"http://localhost:8080"
    }
  },
  //开发服务器配置
  server: {
    // host: 'localhost',
    port: 8080,
    open: true,
    // proxy: {
    //   // '/api': {
    //   //   target:process.env.VITE_WMS_BASE_URL,
    //   //   changeOrigin: true,
    //   //   rewrite: path => path.replace('/api', ''),
    //   //   toProxy: true
    //   // },
    //   // '^/onlinePreview/.*': {
    //   //   target: process.env.VUE_APP_ONLINE_BASE_URL,
    //   //   changeOrigin: true,
    //   //   rewrite: path => path.replace(/^\/onlinePreview/, '')
    //   // },
    //   // '/socket.io': {
    //   //   target: process.env.VUE_APP_SOCKET_IO_BASE_URL,
    //   //   ws: true
    //   // }
    // }
    //cors:true,
  },
  //构建配置
  build: {
    // rollupOptions: {
    //   input: {
    //     main: resolve(__dirname, 'index.html'),
    //     nested: resolve(__dirname, 'server/index.html')
    //   }
    // }
    //target:['modules'],//设置最终构建的浏览器兼容目标。
    outDir: './dist'
    //assetsDir:'assets',
    //cssCodeSplit:true,//css代码拆分
    //cssTarget:['modules'],//css压缩兼容性目标
    //sourcemap: false,//构建后是否生成 source map 文件
    //emptyOutDir:true//每次构建时清空dist目录
  },
  //使用插件
  plugins: [
    vue()
    // legacy({
    //   targets: ['> 1%, last 2 versions']
    // })
  ],
  // 定制主题
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true //允许less内执行js
      }
    }
  }
})
