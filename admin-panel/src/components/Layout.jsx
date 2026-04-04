import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import '../styles/Layout.css';
import logo from '../assets/logo.png';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.includes(path);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
    { key: 'apresentacoes', label: 'Apresentacoes', route: '/admin/apresentacoes' },
    { key: 'datas', label: 'Datas do Festival', route: '/admin/datas' },
    { key: 'parcerias', label: 'Apoios e Patrocinios', route: '/admin/parcerias' },
    { key: 'usuarios', label: 'Usuarios', route: null }
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="FETEG Logo" className="logo-img" />
          <p className="brand-kicker">Painel criativo</p>
        </div>

        <nav className="menu">
          {menuItems.map((item) => {
            const ativo = item.key === 'dashboard'
              ? isActive('dashboard') && !isActive('apresentacoes')
              : isActive(item.key);

            return (
              <button
                key={item.key}
                type="button"
                className={`menu-item ${ativo ? 'active' : ''}`}
                onClick={() => item.route && navigate(item.route)}
                disabled={!item.route}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="top-kicker">FETEG Teatro</p>
            <h1>Painel Administrativo</h1>
          </div>
          <div className="user-info">
            Admin | FETEG Teatro
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}