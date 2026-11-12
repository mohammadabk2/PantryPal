import 'i18next'
import type { defaultNS, resources } from './index'

// Gives t() autocomplete and makes unknown keys a type error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['en']
  }
}
