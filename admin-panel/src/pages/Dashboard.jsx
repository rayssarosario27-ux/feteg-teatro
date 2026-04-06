import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { getApiBaseUrl } from '../utils/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const API_URL = getApiBaseUrl();
  const [apresentacoes, setApresentacoes] = useState([]);
  const [datas, setDatas] = useState([]);
  const [parcerias, setParcerias] = useState([]);
  const [slideAtivo, setSlideAtivo] = useState(0);
  const [publicando, setPublicando] = useState(false);
  const [ultimaPublicacao, setUltimaPublicacao] = useState(null);
  const [publicadoManualmente, setPublicadoManualmente] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null });
  const [messageDialog, setMessageDialog] = useState({
    isOpen: false,
    title: '',
    lines: [],
    variant: 'success'
  });

  const carregarResumoPublico = async () => {
    const resposta = await fetch(`${API_URL}/api/publico`, { cache: 'no-store' });
    if (!resposta.ok) {
      throw new Error(`Falha API: ${resposta.status}`);
    }

    const dados = await resposta.json();
    const apresentacoesPublicas = Array.isArray(dados.apresentacoes) ? dados.apresentacoes.length : 0;
    const parceriasPublicas = Array.isArray(dados.parcerias) ? dados.parcerias.length : 0;
    const datasPublicas = Array.isArray(dados.datas) ? dados.datas.length : 0;

    return {
      publishedAt: dados.publishedAt || null,
      publishedByAdmin: Boolean(dados.publishedByAdmin),
      apresentacoesPublicas,
      parceriasPublicas,
      datasPublicas
    };
  };

  const abrirMensagem = (title, lines, variant = 'success') => {
    setMessageDialog({
      isOpen: true,
      title,
      lines: Array.isArray(lines) ? lines : [String(lines)],
      variant
    });
  };

  const fecharMensagem = () => {
    setMessageDialog({ isOpen: false, title: '', lines: [], variant: 'success' });
  };

  useEffect(() => {
    const carregarApresentacoes = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/apresentacoes`, { cache: 'no-store' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const dados = await resposta.json();
        const lista = Array.isArray(dados) ? dados : [];
        setApresentacoes(lista);
        if (slideAtivo >= lista.length) {
          setSlideAtivo(0);
        }
      } catch (error) {
        console.error('Erro ao carregar apresentacoes:', error);
        setApresentacoes([]);
      }
    };

    carregarApresentacoes();
  }, [API_URL]);

  useEffect(() => {
    const carregarDatas = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/datas`, { cache: 'no-store' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const dados = await resposta.json();
        setDatas(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error('Erro ao carregar datas:', error);
        setDatas([]);
      }
    };

    carregarDatas();
  }, [API_URL]);

  useEffect(() => {
    const carregarParcerias = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/parcerias`, { cache: 'no-store' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const dados = await resposta.json();
        setParcerias(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error('Erro ao carregar parcerias:', error);
        setParcerias([]);
      }
    };

    carregarParcerias();
  }, [API_URL]);

  useEffect(() => {
    const carregarStatusPublicacao = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/publico`, { cache: 'no-store' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const dados = await resposta.json();
        setUltimaPublicacao(dados.publishedAt || null);
        setPublicadoManualmente(Boolean(dados.publishedByAdmin));
      } catch (error) {
        console.error('Erro ao carregar status de publicacao:', error);
      }
    };

    carregarStatusPublicacao();
  }, [API_URL]);

  const handlePublicarAtualizacao = async () => {
    setPublicando(true);
    try {
      const resposta = await fetch(`${API_URL}/api/publicar-site`, {
        method: 'POST',
        cache: 'no-store'
      });

      if (!resposta.ok) {
        throw new Error(`Falha API: ${resposta.status}`);
      }

      await resposta.json();
      const resumo = await carregarResumoPublico();
      setUltimaPublicacao(resumo.publishedAt);
      setPublicadoManualmente(resumo.publishedByAdmin);
      abrirMensagem('Atualizacao publicada com sucesso', [
        `Apresentacoes: ${resumo.apresentacoesPublicas}`,
        `Parcerias: ${resumo.parceriasPublicas}`,
        `Datas: ${resumo.datasPublicas}`
      ]);
    } catch (error) {
      console.error('Erro ao publicar atualizacao:', error);
      abrirMensagem('Falha ao publicar', ['Nao foi possivel publicar agora.', 'Tente novamente.'], 'error');
    } finally {
      setPublicando(false);
    }
  };

  const handleTirarAtualizacaoDoAr = async () => {
    setConfirmDialog({ isOpen: true, type: 'tirar-atualizacao' });
  };

  const confirmarTirarAtualizacao = async () => {
    setPublicando(true);
    try {
      const resposta = await fetch(`${API_URL}/api/tirar-site-do-ar`, {
        method: 'POST',
        cache: 'no-store'
      });

      if (!resposta.ok) {
        throw new Error(`Falha API: ${resposta.status}`);
      }

      await resposta.json();
      const resumo = await carregarResumoPublico();
      setUltimaPublicacao(resumo.publishedAt);
      setPublicadoManualmente(resumo.publishedByAdmin);
      abrirMensagem('Atualizacao retirada do ar', [
        `Snapshot atual: ${resumo.apresentacoesPublicas} apresentacoes`,
        `${resumo.parceriasPublicas} parcerias`,
        `${resumo.datasPublicas} datas`
      ]);
    } catch (error) {
      console.error('Erro ao tirar atualizacao do ar:', error);
      abrirMensagem('Falha ao remover do ar', ['Nao foi possivel concluir a operacao agora.', 'Tente novamente.'], 'error');
    } finally {
      setConfirmDialog({ isOpen: false, type: null });
      setPublicando(false);
    }
  };

  const handleCarouselUpload = async (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const resposta = await fetch(`${API_URL}/api/apresentacoes/${id}`, {
          method: 'PUT',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagemCarousel: event.target.result })
        });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const atualizado = await resposta.json();
        setApresentacoes((atual) =>
          atual.map((ap) => (ap.id === id ? atualizado : ap))
        );
      } catch (error) {
        console.error('Erro ao salvar imagem do carrossel:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const limparImagemCarousel = async (id) => {
    try {
      const resposta = await fetch(`${API_URL}/api/apresentacoes/${id}`, {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagemCarousel: null })
      });
      if (!resposta.ok) {
        throw new Error(`Falha API: ${resposta.status}`);
      }
      const atualizado = await resposta.json();
      setApresentacoes((atual) =>
        atual.map((ap) => (ap.id === id ? atualizado : ap))
      );
    } catch (error) {
      console.error('Erro ao limpar imagem do carrossel:', error);
    }
  };

  const irSlideAnterior = () => {
    if (apresentacoes.length === 0) return;
    setSlideAtivo((prev) => (prev === 0 ? apresentacoes.length - 1 : prev - 1));
  };

  const irSlideProximo = () => {
    if (apresentacoes.length === 0) return;
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
    setConfirmDialog({ isOpen: true, type: 'delete-apresentacao' });
  };

  const confirmarDeleteApresentacao = () => {
    setConfirmDialog({ isOpen: false, type: null });
    abrirMensagem('Apresentacao removida', ['A apresentacao foi deletada com sucesso.']);
  };

  const apresentacaoAtual = apresentacoes[slideAtivo];

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <p className="dashboard-kicker">Controle Criativo</p>
        <h1>Dashboard</h1>
        <p>Visual premium, leitura rápida e gestão direta do conteúdo exibido no frontend.</p>
        <div className="publish-box">
          <div className="publish-actions">
            <button
              type="button"
              className="btn-publicar"
              onClick={handlePublicarAtualizacao}
              disabled={publicando}
            >
              {publicando ? 'Processando...' : 'Publicar conteudo no site'}
            </button>
            <button
              type="button"
              className="btn-despublicar"
              onClick={handleTirarAtualizacaoDoAr}
              disabled={publicando}
            >
              Tirar atualizacao do ar
            </button>
          </div>
          <span className="publish-status">
            {publicadoManualmente && ultimaPublicacao
              ? `Ultima publicacao: ${new Date(ultimaPublicacao).toLocaleString('pt-BR')}`
              : 'Sem atualizacao publicada manualmente'}
          </span>
        </div>
      </div>

      {/* GRID DE CARDS STATS */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/apresentacoes')}>
          <div className="stat-card-icon">🎬</div>
          <div className="stat-card-body">
            <p className="stat-label">Apresentações</p>
            <h3 className="stat-value">{apresentacoes.length}</h3>
            <span className="stat-desc">ativas</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/datas')}>
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-body">
            <p className="stat-label">Datas</p>
            <h3 className="stat-value">{datas.length}</h3>
            <span className="stat-desc">dias programados</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/parcerias')}>
          <div className="stat-card-icon">🤝</div>
          <div className="stat-card-body">
            <p className="stat-label">Parcerias</p>
            <h3 className="stat-value">{parcerias.length}</h3>
            <span className="stat-desc">apoiadores</span>
          </div>
          <div className="stat-card-arrow">→</div>
        </div>

      </div>

      <section className="carousel-admin-section">
        <div className="section-title">
          <h2>Carrossel do Frontend</h2>
          <span className="carousel-badge">Sincronizado via API</span>
        </div>

        {apresentacaoAtual ? (
          <div className="carousel-preview-shell">
            <img
              src={getImagem(apresentacaoAtual)}
              alt={apresentacaoAtual.nome}
              className="carousel-preview-img"
            />
            <div className="carousel-preview-overlay" />
            <div className="carousel-preview-content">
              <h3>{apresentacaoAtual.nome}</h3>
              <p>{apresentacaoAtual.genero}</p>
            </div>
            <button type="button" className="slide-btn prev" onClick={irSlideAnterior}>‹</button>
            <button type="button" className="slide-btn next" onClick={irSlideProximo}>›</button>
          </div>
        ) : (
          <div className="carousel-preview-shell">
            <div className="carousel-preview-content">
              <h3>Sem apresentações cadastradas</h3>
            </div>
          </div>
        )}

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

      <div
        className={`message-overlay ${messageDialog.isOpen ? 'open' : ''} ${messageDialog.variant}`}
        aria-hidden={!messageDialog.isOpen}
        onClick={fecharMensagem}
      >
        {messageDialog.isOpen && (
          <div
            className="message-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="message-orbit" aria-hidden="true" />
            <p className="message-kicker">FETEG Teatro</p>
            <h3 id="message-title">{messageDialog.title}</h3>
            <div className="message-lines">
              {messageDialog.lines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <button type="button" className="message-ok" onClick={fecharMensagem}>
              OK
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'tirar-atualizacao'}
        title="Tirar Atualização do Ar?"
        message="O frontend voltará para a tela de 'Novidades em breve'. Esta ação não pode ser desfeita imediatamente."
        onConfirm={confirmarTirarAtualizacao}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
        isLoading={publicando}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete-apresentacao'}
        title="Deletar Apresentação?"
        message="Esta ação é irreversível. A apresentação será removida permanentemente."
        onConfirm={confirmarDeleteApresentacao}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
      />
    </div>
  );
}
