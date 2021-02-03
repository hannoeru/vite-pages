import { Component } from 'vue'

type Lazy<T> = () => Promise<T>

interface Route {
  name?: string
  path: string
  props?: boolean
  component: Component | Lazy<Component>
  children?: Route[]
  meta?: Record<string, unknown>
}

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

export type UserOptions = Partial<Options>

function resolveOptions(userOptions?: UserOptions): Options {
  const defaultOptions = {
    extensions: ['vue', 'md'],
    pagesDir: 'pages',
  }
  return Object.assign({}, defaultOptions, userOptions)
}

/**
 * https://github.com/brattonross/vite-plugin-voie/blob/main/packages/vite-plugin-voie/src/routes.ts
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/brattonross/vite-plugin-voie/blob/main/LICENSE
 */

function isDynamicRoute(routePath: string) {
  const dynamicRouteRE = new RegExp('^\\[.+\\]$')
  return dynamicRouteRE.test(routePath)
}

function prepareRoutes(
  routes: Route[],
  options: Options,
  parent?: Route,
) {
  for (const route of routes) {
    if (route.name)
      route.name = route.name.replace(/-index$/, '')

    if (parent)
      route.path = route.path.replace(/^\//, '').replace(/\?$/, '')

    route.props = true

    if (route.children) {
      delete route.name
      route.children = prepareRoutes(route.children, options, route)
    }
    if (typeof options?.extendRoute === 'function')
      Object.assign(route, options.extendRoute(route, parent) || {})
  }
  return routes
}

export function generateRoutes(filesPath: Record<string, Lazy<Component>>, userOptions?: UserOptions) {
  const options = resolveOptions(userOptions)
  const {
    pagesDir,
    extensions,
  } = options
  const extensionsRE = new RegExp(`\\.(${extensions.join('|')})$`)

  const routes: Route[] = []

  for (const filePath of Object.keys(filesPath)) {
    const resolvedPath = filePath.replace(extensionsRE, '').replace(`./${pagesDir}/`, '')
    const pathNodes = resolvedPath.split('/')

    const component = filesPath[filePath]
    const route = {
      name: '',
      path: '',
      component,
    }

    let parentRoutes = routes

    for (let i = 0; i < pathNodes.length; i++) {
      const node = pathNodes[i]
      const isDynamic = isDynamicRoute(node)
      const isLastOne = i === pathNodes.length - 1
      const normalizedPart = (isDynamic
        ? node.replace(/^\[(\.{3})?/, '').replace(/\]$/, '')
        : node
      ).toLowerCase()

      route.name += route.name ? `-${normalizedPart}` : normalizedPart

      // Check nested route
      const parent = parentRoutes.find(node => node.name === route.name)

      if (parent) {
        parent.children = parent.children || []
        parentRoutes = parent.children
        route.path = ''
      }
      else if (normalizedPart === 'index' && !route.path) {
        route.path += '/'
      }
      else if (normalizedPart !== 'index') {
        if (isDynamic) {
          route.path += `/:${normalizedPart}`
          // Catch-all route
          if (/^\[\.{3}/.test(node))
            route.path += '(.*)'
          else if (isLastOne)
            route.path += '?'
        }
        else {
          route.path += `/${normalizedPart}`
        }
      }
    }
    parentRoutes.push(route)
  }

  const preparedRoutes = prepareRoutes(routes, options)

  return preparedRoutes
}
