export function applyMixins(this: any, modules: any[]) {
  modules.forEach(module => {
    const namespace: string = module.name
    this[namespace] = {}
    const propertyNames = Object.getOwnPropertyNames(module)
    propertyNames.forEach(name => {
      const val = module[name]
      if (typeof val === "function") {
        this[namespace][name] = val.bind(this)
      } else {
        this[namespace][name] = val
      }
    })
  })
}
