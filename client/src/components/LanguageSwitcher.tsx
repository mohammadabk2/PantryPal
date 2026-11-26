import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../i18n'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <label className="language-switcher">
      <span>{t('common.language')}</span>
      <select
        value={i18n.resolvedLanguage}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {supportedLanguages.map(({ code, label }) => (
          <option key={code} value={code} lang={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LanguageSwitcher
