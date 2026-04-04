import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Apresentacoes.css';

export default function Apresentacoes() {
  const navigate = useNavigate();
  const [apresentacoes, setApresentacoes] = useState([
    { 
      id: 1, 
      nome: 'Romeu e Julieta', 
      classificacao: '12 anos',
      duracao: '120m',
      genero: 'Drama, Romance',
      data: '15-20 abr',
      status: 'ativo'
      ,imagemCard: null,
      imagemCarousel: null
    },
    { 
      id: 2, 
      nome: 'Cinderela', 
      classificacao: 'L',
      duracao: '100m',
      genero: 'Infantil, Fantasia',
      data: 'Jun-Jul',
      status: 'ativo'
      ,imagemCard: null,
      imagemCarousel: null
    },
    { 
      id: 3, 
      nome: 'Aladim', 
      classificacao: '10 anos',
      duracao: '110m',
      genero: 'Aventura, Fantasia',
      data: 'Agosto',
      status: 'rascunho'
      ,imagemCard: null,
      imagemCarousel: null
    }
  ]);

  const [pesquisa, setPesquisa] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [modalImagem, setModalImagem] = useState(null);
  const [tipoImagem, setTipoImagem] = useState('card');
  const [imagemPreview, setImagemPreview] = useState(null);

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

  const handleSalvarImagem = () => {
    if (imagemPreview && modalImagem) {
      const novasApresentacoes = apresentacoes.map(ap => {
        if (ap.id === modalImagem) {
          if (tipoImagem === 'card') {
            return { ...ap, imagemCard: imagemPreview };
          }
          return { ...ap, imagemCarousel: imagemPreview };
        }
        return ap;
      });

      setApresentacoes(novasApresentacoes);

      novasApresentacoes.forEach(ap => {
        localStorage.setItem(`ap_${ap.id}_data`, JSON.stringify(ap));
      });

      setModalImagem(null);
      setImagemPreview(null);
      alert('✅ Imagem salva com sucesso!');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      const novasApresentacoes = apresentacoes.filter(ap => ap.id !== id);
      setApresentacoes(novasApresentacoes);
      localStorage.removeItem(`ap_${id}_data`);
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
                <th>Datas</th>
                <th>Status</th>
                <th>Imagens</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {apresentacoesFiltradas.map(ap => (
                <tr key={ap.id}>
                  <td className="thumb-cell">
                    <img src={getImagemThumb(ap)} alt={ap.nome} className="thumb-img" />
                  </td>
                  <td>{ap.nome}</td>
                  <td>{ap.classificacao}</td>
                  <td>{ap.duracao}</td>
                  <td>{ap.genero}</td>
                  <td>{ap.data}</td>
                  <td>
                    <span className={`status ${ap.status}`}>
                      {ap.status}
                    </span>
                  </td>
                  <td className="imagens-cell">
                    <button
                      className={`btn-imagem ${ap.imagemCard ? 'ativo' : ''}`}
                      onClick={() => {
                        setModalImagem(ap.id);
                        setTipoImagem('card');
                        setImagemPreview(null);
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
                        setImagemPreview(null);
                      }}
                      title="Imagem do Carousel"
                    >
                      {ap.imagemCarousel ? 'Carrossel ativo' : 'Enviar carrossel'}
                    </button>
                  </td>
                  <td className="acoes-cell">
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
                  <img src={imagemPreview} alt="Preview" className="preview-img" />
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
    </div>
  );
}