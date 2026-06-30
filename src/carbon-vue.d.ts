declare module '@carbon/vue' {
  import type { App } from 'vue'
  const CarbonVue: { install(app: App): void }
  export default CarbonVue
}
