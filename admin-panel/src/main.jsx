import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/GlobalMessage.css'

function GlobalMessageBridge({ children }) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const originalAlert = window.alert

    window.alert = (value) => {
      setMessage(String(value ?? ''))
    }

    return () => {
      window.alert = originalAlert
    }
  }, [])

  const variant = useMemo(() => {
    if (!message) return 'success'
    return /nao foi possivel|não foi possível|erro|falha|nao conseguiu/i.test(message)
      ? 'error'
      : 'success'
  }, [message])

  const lines = useMemo(() => {
    return message
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }, [message])

  const closeMessage = () => setMessage('')

  return (
    <>
      {children}
      {message && (
        <div
          className={`global-message-overlay open ${variant}`}
          onClick={closeMessage}
          aria-hidden={false}
        >
          <div
            className="global-message-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-message-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="global-message-orbit" aria-hidden="true" />
            <p className="global-message-kicker">FETEG Teatro</p>
            <h3 id="global-message-title">
              {variant === 'error' ? 'Operação não concluída' : 'Atualização confirmada'}
            </h3>
            <div className="global-message-lines">
              {lines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <button type="button" className="global-message-ok" onClick={closeMessage}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalMessageBridge>
      <App />
    </GlobalMessageBridge>
  </React.StrictMode>,
)