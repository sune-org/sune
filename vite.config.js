import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import htmlInject from 'vite-plugin-html-inject'

export default defineConfig({
  build:{ minify:false },
  plugins:[
    htmlInject(),
    VitePWA({
      registerType:'autoUpdate',
      manifest:{
        id:'/',
        name:'Sune',
        short_name:'Sune',
        description:'OpenRouter GUI Frontend',
        start_url:'/',
        display:'standalone',
        orientation:'portrait',
        theme_color:'#FFFFFF',
        background_color:'#000000',
        categories:['productivity','utilities'],
        icons:[{ src:'/appstore_content/✺.png', sizes:'1024x1024', type:'image/png' }],
        screenshots:[{ src:'/appstore_content/screenshot1.jpg', sizes:'1344x2693', type:'image/jpeg' },{ src:'/appstore_content/screenshot2.jpg', sizes:'1344x2699', type:'image/jpeg' }]
      }
    })
  ]
})
