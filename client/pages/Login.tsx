import { Link } from 'react-router'

function Login() {
  return (
    <section id="center">
      <h1 className="title">Login</h1>
      <p>Login form goes here.</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}

export default Login
