import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import '../styles/Layout.css';
import logo from '../assets/logo.png';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="FETEG Logo" className="logo-img" />
        </div>

        <nav className="menu">
          <a 
            href="#dashboard" 
            className={`menu-item ${isActive('dashboard') && !isActive('apresentacoes') ? 'active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            📊 Dashboard
          </a>
          <a 
            href="#apresentacoes" 
            className={`menu-item ${isActive('apresentacoes') ? 'active' : ''}`}
            onClick={() => navigate('/admin/apresentacoes')}
          >
            🎬 Apresentações
          </a>
          <a 
            href="#datas" 
            className={`menu-item ${isActive('datas') ? 'active' : ''}`}
            onClick={() => navigate('/admin/datas')}
          >
            📅 Datas do Festival
          </a>
          <a 
            href="#parcerias" 
            className={`menu-item ${isActive('parcerias') ? 'active' : ''}`}
            onClick={() => navigate('/admin/parcerias')}
          >
            🤝 Apoios/Patrocínios
          </a>
          <a href="#usuarios" className="menu-item">
            👤 Usuários
          </a>
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          🚪 Sair
        </button>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <h1>Painel Administrativo</h1>
          <div className="user-info">
            👤 Admin | FETEG Teatro
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}