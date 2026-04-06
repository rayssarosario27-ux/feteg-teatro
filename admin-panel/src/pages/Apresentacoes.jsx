import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { getApiBaseUrl } from '../utils/api';
import '../styles/Apresentacoes.css';

export default function Apresentacoes() {
  const navigate = useNavigate();
  const API_URL = getApiBaseUrl();
  const [apresentacoes, setApresentacoes] = useState([]);

  const [pesquisa, setPesquisa] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [modalImagem, setModalImagem] = useState(null);
  const [tipoImagem, setTipoImagem] = useState('card');
  const [imagemPreview, setImagemPreview] = useState(null);
  const [ajusteCarouselY, setAjusteCarouselY] = useState(50);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, deleteId: null });

  const extrairPosicaoY = (posicao) => {
    const valor = String(posicao || '').trim();
    const match = valor.match(/\s(\d{1,3})%$/);
    if (!match) return 50;
    const numero = Number(match[1]);
    if (Number.isNaN(numero)) return 50;
    return Math.min(100, Math.max(0, numero));
  };

  useEffect(() => {
    const carregarApresentacoes = async () => {
      try {
        // Busca igual ao Dashboard, sem filtros extras
        const resposta = await fetch(`${API_URL}/api/apresentacoes`, { cache: 'no-store' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const dados = await resposta.json();
        setApresentacoes(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error('Erro ao carregar apresentacoes:', error);
        setApresentacoes([]);
      }
    };
    carregarApresentacoes();
  }, [API_URL]);

  const apresentacoesFiltradas = useMemo(() => {
    return apresentacoes.filter(ap => {
      const matchPesquisa = ap.nome.toLowerCase().includes(pesquisa.toLowerCase());
      const matchStatus = statusFiltro === 'todos' || ap.status === statusFiltro;
      return matchPesquisa && matchStatus;
    });
  }, [apresentacoes, pesquisa, statusFiltro]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagemPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarImagem = async () => {
    if (imagemPreview && modalImagem) {
      const alvo = apresentacoes.find((ap) => ap.id === modalImagem);
      if (!alvo) return;

      const payload = {
        ...(tipoImagem === 'card'
          ? { imagemCard: imagemPreview }
          : {
              imagemCarousel: imagemPreview,
              imagemCarouselPosicao: `50% ${ajusteCarouselY}%`
            })
      };

      try {
        const resposta = await fetch(`${API_URL}/api/apresentacoes/${modalImagem}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }

        const atualizado = await resposta.json();
        setApresentacoes((atual) =>
          atual.map((ap) => (ap.id === modalImagem ? atualizado : ap))
        );

        setModalImagem(null);
        setImagemPreview(null);
        alert('✅ Imagem salva com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        alert('Nao foi possivel salvar a imagem no servidor.');
      }
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({ isOpen: true, deleteId: id });
  };

  const confirmarDelete = async () => {
    const id = confirmDialog.deleteId;
    setConfirmDialog({ isOpen: false, deleteId: null });
    try {
      const resposta = await fetch(`${API_URL}/api/apresentacoes/${id}`, {
        method: 'DELETE'
      });
      if (!resposta.ok) {
        throw new Error(`Falha API: ${resposta.status}`);
      }
      setApresentacoes((atual) => atual.filter((ap) => ap.id !== id));
    } catch (error) {
      console.error('Erro ao deletar apresentacao:', error);
      alert('Nao foi possivel deletar a apresentacao.');
    }
  };

  const handleNew = () => {
    navigate('/admin/apresentacoes/novo');
  };

  const handleEdit = (id) => {
    navigate(`/admin/apresentacoes/${id}`);
  };

  const getApresentacao = (id) => {
    return apresentacoes.find(ap => ap.id === id);
  };

  const getImagemThumb = (ap) => {
    if (ap.imagemCard) {
      return ap.imagemCard;
    }
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23ff6b00" width="50" height="50"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3E${ap.id}%3C/text%3E%3C/svg%3E`;
  };

  return (
    <div className="apresentacoes-page">
      <header className="apresentacoes-hero">
        <div>
          <p className="apresentacoes-kicker">Curadoria de Conteúdo</p>
          <h1>Apresentações</h1>
          <p className="apresentacoes-subtitle">Gerencie peças, status e imagens com um visual mais objetivo e sofisticado.</p>
        </div>
        <div className="header-content">
          <button className="btn-novo" onClick={handleNew}>
            + Nova Apresentação
          </button>
        </div>
      </header>

      <div className="filtros-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="input-pesquisa"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <select 
          className="input-filtro"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="todos">Todos os Status</option>
          <option value="ativo">Ativo</option>
          <option value="rascunho">Rascunho</option>
        </select>
      </div>

      <div className="tabela-container">
        {apresentacoesFiltradas.length > 0 ? (
          <table className="tabela-grande">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Nome</th>
                <th>Classificação</th>
                <th>Duração</th>
                <th>Gênero</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Status</th>
                <th>Imagens</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {apresentacoesFiltradas.map(ap => (
                <tr key={ap.id}>
                  <td className="thumb-cell" data-label="Thumbnail">
                    <img src={getImagemThumb(ap)} alt={ap.nome} className="thumb-img" />
                  </td>
                  <td data-label="Nome">{ap.nome}</td>
                  <td data-label="Classificação">{ap.classificacao}</td>
                  <td data-label="Duração">{ap.duracao}</td>
                  <td data-label="Gênero">{ap.genero}</td>
                  <td data-label="Data">{ap.data}</td>
                  <td data-label="Horário">{ap.horario || '-'}</td>
                  <td data-label="Status">
                    <span className={`status ${ap.status}`}>
                      {ap.status}
                    </span>
                  </td>
                  <td className="imagens-cell" data-label="Imagens">
                    <button
                      className={`btn-imagem ${ap.imagemCard ? 'ativo' : ''}`}
                      onClick={() => {
                        setModalImagem(ap.id);
                        setTipoImagem('card');
                        setImagemPreview(null);
                        setAjusteCarouselY(50);
                      }}
                      title="Imagem do Card"
                    >
                      {ap.imagemCard ? 'Card ativo' : 'Enviar card'}
                    </button>
                    <button
                      className={`btn-imagem ${ap.imagemCarousel ? 'ativo' : ''}`}
                      onClick={() => {
                        setModalImagem(ap.id);
                        setTipoImagem('carousel');
                        setImagemPreview(ap.imagemCarousel || null);
                        setAjusteCarouselY(extrairPosicaoY(ap.imagemCarouselPosicao));
                      }}
                      title="Imagem do Carousel"
                    >
                      {ap.imagemCarousel ? 'Carrossel ativo' : 'Enviar carrossel'}
                    </button>
                  </td>
                  <td className="acoes-cell" data-label="Ações">
                    <button 
                      className="btn-acao btn-editar"
                      onClick={() => handleEdit(ap.id)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-acao btn-deletar"
                      onClick={() => handleDelete(ap.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Nenhuma apresentação encontrada para os filtros aplicados.</p>
          </div>
        )}
      </div>

      {modalImagem && (
        <div className="modal-overlay" onClick={() => setModalImagem(null)}>
          <div className="modal-upload" onClick={(e) => e.stopPropagation()}>
            <h2>{tipoImagem === 'card' ? 'Imagem do Card' : 'Imagem do Carrossel'}</h2>
            <p className="modal-subtitle">
              {getApresentacao(modalImagem)?.nome}
            </p>

            <div className="modal-hint">
              {tipoImagem === 'card' ? (
                <p>Tamanho recomendado: <strong>300x200px</strong></p>
              ) : (
                <p>Tamanho recomendado: <strong>800x450px</strong></p>
              )}
            </div>

            <div className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="file-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="upload-label">
                <div className="upload-icon">Upload</div>
                <p>Selecionar imagem</p>
              </label>

              {imagemPreview && (
                <div className="preview-box">
                  <img
                    src={imagemPreview}
                    alt="Preview"
                    className="preview-img"
                    style={tipoImagem === 'carousel' ? { objectPosition: `50% ${ajusteCarouselY}%` } : undefined}
                  />

                  {tipoImagem === 'carousel' && (
                    <div className="carousel-ajuste-box">
                      <label htmlFor="ajuste-carousel-y" className="carousel-ajuste-label">
                        Ajuste vertical da imagem: <strong>{ajusteCarouselY}%</strong>
                      </label>
                      <input
                        id="ajuste-carousel-y"
                        type="range"
                        min="0"
                        max="100"
                        value={ajusteCarouselY}
                        onChange={(e) => setAjusteCarouselY(Number(e.target.value))}
                        className="carousel-ajuste-range"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn-remover-img"
                    onClick={() => setImagemPreview(null)}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-salvar" onClick={handleSalvarImagem}>
                Salvar imagem
              </button>
              <button className="btn-cancelar" onClick={() => setModalImagem(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Deletar Apresentação?"
        message="Esta ação é irreversível. A apresentação será removida permanentemente do sistema."
        onConfirm={confirmarDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, deleteId: null })}
      />
    </div>
  );
}