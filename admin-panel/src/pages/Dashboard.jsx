import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [apresentacoes, setApresentacoes] = useState(() => {
    const base = [
      {
        id: 1,
        nome: 'Romeu e Julieta',
        data: '15-20 abr',
        status: 'ativo',
        genero: 'Drama, Romance',
        local: 'Teatro Municipal',
        classificacao: '12 anos',
        duracao: '120',
        imagemCard: null,
        imagemCarousel: null
      },
      {
        id: 2,
        nome: 'Cinderela',
        data: 'Jun-Jul',
        status: 'ativo',
        genero: 'Infantil, Fantasia',
        local: 'Auditório Principal',
        classificacao: 'L',
        duracao: '100',
        imagemCard: null,
        imagemCarousel: null
      },
      {
        id: 3,
        nome: 'Aladim',
        data: 'Agosto',
        status: 'ativo',
        genero: 'Aventura, Fantasia',
        local: 'Teatro Popular',
        classificacao: '10 anos',
        duracao: '110',
        imagemCard: null,
        imagemCarousel: null
      }
    ];

    return base.map((ap) => {
      const salvo = localStorage.getItem(`ap_${ap.id}_data`);
      return salvo ? { ...ap, ...JSON.parse(salvo) } : ap;
    });
  });
  const [slideAtivo, setSlideAtivo] = useState(0);

  const salvarNoFrontend = (item) => {
    localStorage.setItem(`ap_${item.id}_data`, JSON.stringify(item));
  };

  const handleCarouselUpload = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setApresentacoes((atual) =>
        atual.map((ap) => {
          if (ap.id !== id) return ap;
          const atualizado = { ...ap, imagemCarousel: event.target.result };
          salvarNoFrontend(atualizado);
          return atualizado;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const limparImagemCarousel = (id) => {
    setApresentacoes((atual) =>
      atual.map((ap) => {
        if (ap.id !== id) return ap;
        const atualizado = { ...ap, imagemCarousel: null };
        salvarNoFrontend(atualizado);
        return atualizado;
      })
    );
  };

  const irSlideAnterior = () => {
    setSlideAtivo((prev) => (prev === 0 ? apresentacoes.length - 1 : prev - 1));
  };

  const irSlideProximo = () => {
    setSlideAtivo((prev) => (prev + 1) % apresentacoes.length);
  };

  const getImagem = (item) => {
    if (item.imagemCarousel) return item.imagemCarousel;
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1280" height="520"%3E%3Cdefs%3E%3ClinearGradient id="bg" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%230e1017"/%3E%3Cstop offset="100%25" stop-color="%23ff6b00"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23bg)" width="1280" height="520"/%3E%3Ctext x="50%25" y="50%25" font-size="62" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold"%3E${item.nome}%3C/text%3E%3C/svg%3E`;
  };

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
        <p className="dashboard-kicker">Controle Criativo</p>
        <h1>Dashboard</h1>
        <p>Visual premium, leitura rápida e gestão direta do conteúdo exibido no frontend.</p>
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
            <h3 className="stat-value">1,2K</h3>
            <span className="stat-desc">este mês</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>
      </div>

      <section className="carousel-admin-section">
        <div className="section-title">
          <h2>Carrossel do Frontend</h2>
          <span className="carousel-badge">Sincronizado via localStorage</span>
        </div>

        <div className="carousel-preview-shell">
          <img
            src={getImagem(apresentacoes[slideAtivo])}
            alt={apresentacoes[slideAtivo].nome}
            className="carousel-preview-img"
          />
          <div className="carousel-preview-overlay" />
          <div className="carousel-preview-content">
            <h3>{apresentacoes[slideAtivo].nome}</h3>
            <p>{apresentacoes[slideAtivo].genero}</p>
          </div>
          <button type="button" className="slide-btn prev" onClick={irSlideAnterior}>‹</button>
          <button type="button" className="slide-btn next" onClick={irSlideProximo}>›</button>
        </div>

        <div className="carousel-editor-grid">
          {apresentacoes.map((ap, index) => (
            <article
              key={ap.id}
              className={`carousel-editor-card ${index === slideAtivo ? 'active' : ''}`}
            >
              <button
                type="button"
                className="card-select"
                onClick={() => setSlideAtivo(index)}
              >
                Slide {index + 1}
              </button>
              <h4>{ap.nome}</h4>
              <p>{ap.local}</p>

              <label htmlFor={`upload-carousel-${ap.id}`} className="btn-upload-carousel">
                Trocar imagem
              </label>
              <input
                id={`upload-carousel-${ap.id}`}
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={(e) => handleCarouselUpload(ap.id, e.target.files?.[0])}
              />
              <button
                type="button"
                className="btn-clear-carousel"
                onClick={() => limparImagemCarousel(ap.id)}
              >
                Remover imagem
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE APRESENTAÇÕES */}
      <div className="presentations-section">
        <div className="section-title">
          <h2>Apresentações Recentes</h2>
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
          <p>Ao atualizar as imagens do carrossel aqui no painel, o destaque principal da Home muda automaticamente no frontend.</p>
        </div>
      </div>
    </div>
  );
}
