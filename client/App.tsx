import appLogo from './assets/logo-wordmark.svg'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import './App.css'

function App() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <LanguageSwitcher />
      <section id="center">
        <div>        <h1 className="logo">
          <img src={appLogo} alt={t('common.appName')} width={250} height={64} />
        </h1></div>


        <div>
          <h1 className="title">{t('home.welcome')}</h1>
        </div>

        <div>
          <button className="button" onClick={() => navigate('/login')}>
            {t('home.login')}
          </button>
        </div>

        <div>
          <h2 className="subtitle">{t('home.noAccount')}</h2>
          <button className="button" onClick={() => navigate('/signup')}>
            {t('home.signUp')}
          </button>
        </div>



      </section>



      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
