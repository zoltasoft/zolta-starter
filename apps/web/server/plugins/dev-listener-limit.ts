export default defineNitroPlugin((nitroApp) => {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Nuxt dev can mount many Node-style middlewares; h3 adds close/error
  // listeners per middleware invocation, which can exceed Node's default of 10.
  nitroApp.hooks.hook('request', (event) => {
    const reqMax = event.node.req.getMaxListeners()
    if (reqMax < 30) {
      event.node.req.setMaxListeners(30)
    }

    const resMax = event.node.res.getMaxListeners()
    if (resMax < 30) {
      event.node.res.setMaxListeners(30)
    }
  })
})
