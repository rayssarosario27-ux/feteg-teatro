import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Credenciais: admin@feteg.com / 123456
    if (usuario === 'admin@feteg.com' && senha === '123456') {
      localStorage.setItem('adminToken', 'token123');
      navigate('/admin/dashboard');
    } else {
      setErro('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎭 FETEG TEATRO</h1>
        <h2>Painel Administrativo</h2>
        
        {erro && <div className="erro">{erro}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuário:</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin@feteg.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}