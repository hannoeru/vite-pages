import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { generateRoutes } from 'vite-pages'
import App from './App.vue'
import './index.css'

const pages = import.meta.glob('./pages/**/*.{vue,md}')
const routes = generateRoutes(pages)

console.log(pages, routes)

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.use(router)

app.mount('#app')
