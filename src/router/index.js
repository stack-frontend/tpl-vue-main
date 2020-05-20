import routes from './routes'
import children from './children'
import { createRouter, subApplicationHandler } from './router-helper'

const router = createRouter(routes)

const asyncAppMap = children.reduce((acc, { path, entries }) => {
  acc[path] = [entries[0]]
  return acc
}, {})
const asyncAppList = Object.keys(asyncAppMap)

router.beforeEach(async (to, from, next) => {
  await subApplicationHandler({
    to,
    from,
    next,
    router,
    appMap: asyncAppMap,
    appList: asyncAppList
    // store
  })
})

export default router
