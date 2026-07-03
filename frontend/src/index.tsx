import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Interceptor global de sessão expirada: qualquer 401 vindo da API derruba a
// sessão local e volta pra tela de login, em vez de cada componente mostrar
// "Token expirado" isoladamente. Cobre todos os fetch() do app (TTS,
// Audiobook, Estúdio FX, Clone de Voz) sem precisar alterar cada componente.
const _fetch = window.fetch.bind(window)
window.fetch = async (input, init) => {
  const response = await _fetch(input, init)
  if (response.status === 401 && localStorage.getItem('gama_voz_token')) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    // só reage a chamadas da nossa API (evita interferir em requests externos)
    if (url.includes('/api/')) {
      localStorage.removeItem('gama_voz_token')
      localStorage.removeItem('gama_voz_user')
      window.location.reload()
    }
  }
  return response
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
