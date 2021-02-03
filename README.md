# vite-pages


[![npm version](https://img.shields.io/npm/v/vite-pages)](https://www.npmjs.com/package/vite-pages)

> File system based routes generator for vue-router using [Vite](https://github.com/vitejs/vite)'s [glob import](https://vitejs.dev/guide/features.html#glob-import).

## Getting Started

Install vite-pages:

```bash
$ npm install vite-pages
```

Add to your app entry:

```js
import App from './App.vue'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { generateRoutes } from 'vite-pages'

// https://vitejs.dev/guide/features.html#glob-import
const pages = import.meta.glob('./pages/**/*.vue')

const routes = generateRoutes(pages),

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes
});

app.use(router)
```

## Configuration

```ts
interface Options {
  /**
   * @default ["vue", "md"]
   */
  extensions: string[]
  /**
   * @default "pages"
   */
  pagesDir: string
  extendRoute?: (route: Route, parent: Route | undefined) => Route | void
}
```

### pagesDir

Relative path to the pages directory. Supports globs.

**Default:** `'pages'`

### extensions

Array of valid file extensions for pages.

**Default:** `['vue', 'md']`

### extendRoute

A function that takes a route and optionally returns a modified route. This is useful for augmenting your routes with extra data (e.g. route metadata).

```js
const options = {
  extendRoute(route, parent) {
    if (route.path === '/') {
      // Index is unauthenticated.
      return route;
    }

    // Augment the route with meta that indicates that the route requires authentication.
    return {
      ...route,
      meta: { auth: true },
    }
  },
}
```
