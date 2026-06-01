/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent, ComponentOptionsBase } from 'vue'
  const component: DefineComponent<
    ComponentOptionsBase['props'],
    ComponentOptionsBase['data'],
    unknown
  >
  export default component
}
