import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [apresentacoes] = useState([
    { id: 1, nome: 'Romeu e Julieta', data: '15-20 abr', status: 'ativo' },
    { id: 2, nome: 'Cinderela', data: 'Jun-Jul', status: 'ativo' },
    { id: 3, nome: 'Aladim', data: 'Agosto', status: 'ativo' }
  ]);

  const handleEdit = (id) => {
    navigate(`/admin/apresentacoes/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      alert('Apresentação deletada!');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Bem-vindo ao Painel Administrativo FETEG Teatro</p>
      </div>

      {/* GRID DE CARDS STATS */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/apresentacoes')}>
          <div className="stat-card-icon">🎬</div>
          <div className="stat-card-body">
            <p className="stat-label">Apresentações</p>
            <h3 className="stat-value">3</h3>
            <span className="stat-desc">ativas</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/datas')}>
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-body">
            <p className="stat-label">Datas</p>
            <h3 className="stat-value">6</h3>
            <span className="stat-desc">dias programados</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/parcerias')}>
          <div className="stat-card-icon">🤝</div>
          <div className="stat-card-body">
            <p className="stat-label">Parcerias</p>
            <h3 className="stat-value">12</h3>
            <span className="stat-desc">apoiadores</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">👁️</div>
          <div className="stat-card-body">
            <p className="stat-label">Visualizações</p>
            <h3 className="stat-value">1.2K</h3>
            <span className="stat-desc">este mês</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>
      </div>

      {/* SEÇÃO DE APRESENTAÇÕES */}
      <div className="presentations-section">
        <div className="section-title">
          <h2>📋 Apresentações Recentes</h2>
          <a href="#" onClick={() => navigate('/admin/apresentacoes')} className="view-all">
            Ver todas →
          </a>
        </div>

        <div className="presentations-list">
          {apresentacoes.map((ap, index) => (
            <div key={ap.id} className="presentation-item">
              <div className="item-number">{index + 1}</div>
              <div className="item-info">
                <h4>{ap.nome}</h4>
                <p>{ap.data}</p>
              </div>
              <div className="item-status">
                <span className={`badge badge-${ap.status}`}>
                  {ap.status === 'ativo' ? '● Ativo' : '● Rascunho'}
                </span>
              </div>
              <div className="item-actions">
                <button
                  className="btn-icon edit"
                  onClick={() => handleEdit(ap.id)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon delete"
                  onClick={handleDelete}
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INFO BOX */}
      <div className="info-box">
        <span className="info-icon">💡</span>
        <div className="info-content">
          <h3>Dica do Dia</h3>
          <p>Mantenha as datas do festival atualizadas e gerencie as apresentações para oferecer a melhor experiência aos visitantes!</p>
        </div>
      </div>
    </div>
  );
}
