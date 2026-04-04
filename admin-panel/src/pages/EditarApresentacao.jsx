import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditarApresentacao.css';

export default function EditarApresentacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagemPreview, setImagemPreview] = useState(null);

  const [dados, setDados] = useState({
    nome: 'Romeu e Julieta',
    classificacao: '12 anos',
    duracao: '120',
    genero: 'Drama, Romance',
    sinopse: 'Uma história clássica de amor proibido...',
    elenco: 'João Silva, Maria Santos, Pedro Oliveira',
    avisos: 'Contém cenas de violência',
    dataInicio: '2026-04-15',
    dataFim: '2026-04-20',
    local: 'Teatro Municipal',
    endereco: 'Rua das Flores, 123',
    status: 'ativo'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Apresentação salva com sucesso!');
    navigate('/admin/apresentacoes');
  };

  const handleCancel = () => {
    navigate('/admin/apresentacoes');
  };

  return (
    <div className="editar-page">
      <div className="editar-container">
        <div className="editar-header">
          <p className="editar-kicker">Direcao Artistica</p>
          <h1>{id ? 'Editar Apresentacao' : 'Nova Apresentacao'}</h1>
          <p>Atualize informacoes da peca, agenda e material visual em um unico fluxo.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-apresentacao">
          {/* COLUNA 1 - INFORMAÇÕES */}
          <div className="form-column">
            {/* SEÇÃO: INFORMAÇÕES BÁSICAS */}
            <div className="form-section">
              <h2>Informacoes Basicas</h2>
              
              <div className="form-group">
                <label>Nome da Apresentação *</label>
                <input
                  type="text"
                  name="nome"
                  value={dados.nome}
                  onChange={handleChange}
                  placeholder="Ex: Romeu e Julieta"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Classificação Etária *</label>
                  <select name="classificacao" value={dados.classificacao} onChange={handleChange}>
                    <option>L</option>
                    <option>10 anos</option>
                    <option>12 anos</option>
                    <option>14 anos</option>
                    <option>16 anos</option>
                    <option>18 anos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duração (minutos) *</label>
                  <input
                    type="number"
                    name="duracao"
                    value={dados.duracao}
                    onChange={handleChange}
                    placeholder="120"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gênero *</label>
                <input
                  type="text"
                  name="genero"
                  value={dados.genero}
                  onChange={handleChange}
                  placeholder="Ex: Drama, Romance"
                  required
                />
              </div>
            </div>

            {/* SEÇÃO: DESCRIÇÃO */}
            <div className="form-section">
              <h2>Descricao</h2>

              <div className="form-group">
                <label>Sinopse *</label>
                <textarea
                  name="sinopse"
                  value={dados.sinopse}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Descreva a apresentação..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Elenco</label>
                <textarea
                  name="elenco"
                  value={dados.elenco}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Atores separados por vírgula"
                />
              </div>

              <div className="form-group">
                <label>Avisos/Conteúdo Sensível</label>
                <textarea
                  name="avisos"
                  value={dados.avisos}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Ex: Contém cenas de violência..."
                />
              </div>
            </div>
          </div>

          {/* COLUNA 2 - DATAS E IMAGEM */}
          <div className="form-column">
            {/* SEÇÃO: DATAS */}
            <div className="form-section">
              <h2>Datas</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Data Início *</label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={dados.dataInicio}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Data Fim *</label>
                  <input
                    type="date"
                    name="dataFim"
                    value={dados.dataFim}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO: LOCALIZAÇÃO */}
            <div className="form-section">
              <h2>Localizacao</h2>

              <div className="form-group">
                <label>Local *</label>
                <input
                  type="text"
                  name="local"
                  value={dados.local}
                  onChange={handleChange}
                  placeholder="Ex: Teatro Municipal"
                  required
                />
              </div>

              <div className="form-group">
                <label>Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={dados.endereco}
                  onChange={handleChange}
                  placeholder="Ex: Rua das Flores, 123"
                  required
                />
              </div>
            </div>

            {/* SEÇÃO: IMAGEM/BANNER */}
            <div className="form-section">
              <h2>Imagem do Banner</h2>

              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="image-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-input" className="upload-label">
                  <div className="upload-icon">Upload</div>
                  <div className="upload-text">Selecionar imagem</div>
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
            </div>

            {/* SEÇÃO: STATUS */}
            <div className="form-section">
              <h2>Status</h2>

              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={dados.status} onChange={handleChange}>
                  <option value="ativo">Ativo</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* BOTÕES */}
        <div className="form-actions">
          <button type="submit" className="btn-salvar" onClick={handleSubmit}>
            Salvar apresentacao
          </button>
          <button type="button" className="btn-cancelar" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}