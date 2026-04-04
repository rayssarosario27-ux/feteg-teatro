import React, { useState } from 'react';
import '../styles/Parcerias.css';

export default function Parcerias() {
  const [parcerias, setParcerias] = useState([
    { id: 1, nome: 'Prefeitura Municipal', tipo: 'Apoio' },
    { id: 2, nome: 'Banco XYZ', tipo: 'Patrocínio' },
    { id: 3, nome: 'Universidade Local', tipo: 'Apoio' },
    { id: 4, nome: 'Empresa Tech', tipo: 'Patrocínio' }
  ]);

  const [novaParc, setNovaParc] = useState({ nome: '', tipo: 'Apoio' });
  const [editando, setEditando] = useState(null);

  const handleAdd = () => {
    if (novaParc.nome) {
      if (editando) {
        setParcerias(parcerias.map(p => p.id === editando ? { ...p, ...novaParc } : p));
        setEditando(null);
      } else {
        setParcerias([...parcerias, { id: Date.now(), ...novaParc }]);
      }
      setNovaParc({ nome: '', tipo: 'Apoio' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Deletar esta parceria?')) {
      setParcerias(parcerias.filter(p => p.id !== id));
    }
  };

  const handleEdit = (p) => {
    setNovaParc({ nome: p.nome, tipo: p.tipo });
    setEditando(p.id);
  };

  return (
    <div className="parcerias-page">
      <header className="page-header">
        <div className="header-content">
          <h1>🤝 Apoios e Patrocínios</h1>
        </div>
      </header>

      <div className="form-container">
        <h2>{editando ? '✏️ Editar Parceria' : '➕ Adicionar Nova Parceria'}</h2>
        <div className="form-group">
          <input
            type="text"
            value={novaParc.nome}
            onChange={(e) => setNovaParc({ ...novaParc, nome: e.target.value })}
            placeholder="Nome da Empresa/Instituição"
          />
          <select
            value={novaParc.tipo}
            onChange={(e) => setNovaParc({ ...novaParc, tipo: e.target.value })}
          >
            <option>Apoio</option>
            <option>Patrocínio</option>
          </select>
          <button onClick={handleAdd} className="btn-adicionar">
            {editando ? '✅ Salvar' : '➕ Adicionar'}
          </button>
          {editando && (
            <button onClick={() => {
              setEditando(null);
              setNovaParc({ nome: '', tipo: 'Apoio' });
            }} className="btn-cancelar">
              ❌ Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="tabela-container">
        <table className="tabela-grande">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {parcerias.map(p => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>
                  <span className={`tipo ${p.tipo.toLowerCase()}`}>
                    {p.tipo}
                  </span>
                </td>
                <td>
                  <button className="btn-acao btn-editar" onClick={() => handleEdit(p)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-acao btn-deletar" onClick={() => handleDelete(p.id)}>
                    🗑️ Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
