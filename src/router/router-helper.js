import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const cachedApplications = new Set()

const loadModule = (url) => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = ({ type }) => resolve({ status: type, url })
    script.onerror = ({ type }) => resolve({ status: type, url })
    script.src = url
    document.head.appendChild(script)
  })
}

export const createRouter = (routes = []) => new Router({ scrollBehavior: () => ({ y: 0 }), routes })

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export const resetRouter = (router) => {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export function findRouteConfig (routes = [], target = '') {
  let _path = ''
  let result = null
  const getPath = (pPath, cPath) => cPath.startsWith('/') ? cPath : `${pPath}/${cPath}`

  while (routes.length) {
    const matched = routes.find(({ path }) => target.startsWith(getPath(_path, path)))

    if (matched) {
      _path = getPath(_path, matched.path)

      if (target === _path) {
        result = matched
        break
      } else {
        routes = matched.children || []
      }
    } else {
      break
    }
  }

  return result
}

export const addRoutes = (routes, targetPath, router) => {
  const { options: { routes: initialRoutes } } = router
  const matched = findRouteConfig(initialRoutes, targetPath)

  if (matched) {
    matched.children = (matched.children || []).concat(...routes)
  }

  router.matcher = createRouter(initialRoutes).matcher
}

const genCacheKey = (key) => process.env.NODE_ENV === 'development' ? `${process.env.VUE_APP_PLATFORM}-${key}` : key

const loadApplication = async ({ appMap, matched, router }) => {
  await loadModule(appMap[matched])

  const { routes } = window._application || {}

  window.System.import(appMap[matched])

  // const { default: application } = await window.System.import(appMap[matched])
  // console.log('load application:', application);

  // if (!isObject(application) || !isObject(application.router)) {
  //   return
  // }

  // const { routes, target, hooks } = application.router

  // if (!isArray(routes)) {
  //   return
  // }

  // if (typeof target === 'string') {
  //   addRoutes(routes, target, router)
  // } else {
  //   router.addRoutes(routes)
  // }

  // if (isObject(hooks)) {
  //   addRouterHooks(matched, hooks, router)
  // }

  // if (isFunction(application.init)) {
  //   await application.init()
  // }

  router.addRoutes(routes)

  cachedApplications.add(genCacheKey(matched))
}

export const subApplicationHandler = async ({ to, from, next, router, appMap, appList }) => {
  const matched = appList.find((key) => to.path.startsWith(key))

  // console.log('matched:', matched);

  if (matched) {
    if (!cachedApplications.has(genCacheKey(matched))) {
      try {
        await loadApplication({ appMap, matched, router })
      } catch (err) {
        console.error(err)
        return next(false)
      }

      next(to.fullPath)

      // hack: 修复在子项目强制刷新页面后，需要两次 go(-1) 才可以回到上一页的 BUG
      if (process.env.NODE_ENV === 'production' && from.path === '/') {
        setTimeout(() => {
          router.go(-1)
        }, 300)
      }
    } else {
      next()
    }
  } else {
    next()
  }
}
