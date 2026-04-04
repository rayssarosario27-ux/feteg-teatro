import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Validação simples (você pode conectar com API depois)
    if (email === 'admin@feteg.com' && password === 'admin2026') {
      localStorage.setItem('adminToken', 'token-valido');
      navigate('/admin/dashboard');
    } else {
      setError('Email ou senha incorretos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="FETEG Logo" className="login-logo" />
        <h1>Painel Administrativo</h1>
        <p>FETEG Teatro</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}