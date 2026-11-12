import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en/translation.json'
import ar from '../locales/ar/translation.json'

export const defaultNS = 'translation'

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const

export const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
] as const

// Keep <html lang> and <html dir> in sync so RTL languages lay out correctly.
function syncDocumentLanguage(lng: string) {
  document.documentElement.lang = lng
  document.documentElement.dir = i18n.dir(lng)
}

i18n.on('languageChanged', syncDocumentLanguage)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages.map((l) => l.code),
    nonExplicitSupportedLngs: true, // treat "en-US" as "en", "ar-PS" as "ar"
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'pantrypal.lang',
    },
  })

export default i18n
