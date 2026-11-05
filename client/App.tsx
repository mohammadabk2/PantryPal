import appLogo from './assets/logo-wordmark.svg'
import { useNavigate } from 'react-router'
import './App.css'

function App() {
  const navigate = useNavigate()

  return (
    <>
      <section id="center">
        <div>        <h1 className="logo">
          <img src={appLogo} alt="PantryPal" width={250} height={64} />
        </h1></div>


        <div>
          <h1 className="title">Welcome to PantryPal</h1>
        </div>

        <div>
          <button className="button" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>

        <div>
          <h2 className="subtitle">Don't have an account?</h2>
          <button className="button" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>



      </section>



      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
