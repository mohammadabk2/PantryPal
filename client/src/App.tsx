import appLogo from './assets/logo-wordmark.svg'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useAuth } from './auth/useAuth'

function App() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, status, logout } = useAuth()

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

        {user ? (
          <div>
            <h2 className="subtitle">{t('home.loggedInAs', { name: user.display_name })}</h2>
            <button className="btn btn-secondary" onClick={logout}>
              {t('home.logout')}
            </button>
          </div>
        ) : (
          // While a saved login is being checked, show nothing instead of flashing the login button.
          status === 'anonymous' && (
            <>
              <div>
                <button className="btn" onClick={() => navigate('/login')}>
                  {t('home.login')}
                </button>
              </div>

              <div>
                <h2 className="subtitle">{t('home.noAccount')}</h2>
                <button className="btn" onClick={() => navigate('/signup')}>
                  {t('home.signUp')}
                </button>
              </div>
            </>
          )
        )}



      </section>



      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
