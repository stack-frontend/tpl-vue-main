const isProd = process.env.NODE_ENV === 'production'

export default [
  {
    path: '/child',
    name: 'child',
    entries: [`${isProd ? './child' : 'http://localhost:10241'}/main.js`],
    beforeLoad () {
      window.NProgress.start()
    },
    afterLoad () {
      window.NProgress.done(true)
    }
  }
]
