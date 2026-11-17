import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

function Login() {
  const { t } = useTranslation()

  return (
    <>
      <LanguageSwitcher />
      <section id="center">
        <h1 className="title">{t('login.title')}</h1>
        <p>{t('login.formPlaceholder')}</p>
        <Link to="/">{t('login.backHome')}</Link>
      </section>
    </>
  )
}

export default Login
