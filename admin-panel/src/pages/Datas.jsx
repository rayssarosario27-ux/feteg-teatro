import React, { useState } from 'react';
import '../styles/Datas.css';

export default function Datas() {
  const [datas, setDatas] = useState([
    { id: 1, data: '15/04/2026', evento: 'Abertura Festival', local: 'Teatro Municipal' },
    { id: 2, data: '16/04/2026', evento: 'Romeu e Julieta', local: 'Teatro Municipal' },
    { id: 3, data: '17/04/2026', evento: 'Cinderela', local: 'Auditório Principal' },
    { id: 4, data: '18/04/2026', evento: 'Aladim', local: 'Teatro Popular' },
  ]);

  const [novaData, setNovaData] = useState({ data: '', evento: '', local: '' });
  const [editando, setEditando] = useState(null);

  const handleAdd = () => {
    if (novaData.data && novaData.evento && novaData.local) {
      if (editando) {
        setDatas(datas.map(d => d.id === editando ? { ...d, ...novaData } : d));
        setEditando(null);
      } else {
        setDatas([...datas, { id: Date.now(), ...novaData }]);
      }
      setNovaData({ data: '', evento: '', local: '' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Deletar esta data?')) {
      setDatas(datas.filter(d => d.id !== id));
    }
  };

  const handleEdit = (d) => {
    setNovaData({ data: d.data, evento: d.evento, local: d.local });
    setEditando(d.id);
  };

  return (
    <div className="datas-page">
      <header className="page-header">
        <div className="header-content">
          <h1>📅 Datas do Festival</h1>
        </div>
      </header>

      <div className="form-container">
        <h2>{editando ? '✏️ Editar Data' : '➕ Adicionar Nova Data'}</h2>
        <div className="form-group">
          <input
            type="date"
            value={novaData.data}
            onChange={(e) => setNovaData({ ...novaData, data: e.target.value })}
          />
          <input
            type="text"
            value={novaData.evento}
            onChange={(e) => setNovaData({ ...novaData, evento: e.target.value })}
            placeholder="Nome do Evento"
          />
          <input
            type="text"
            value={novaData.local}
            onChange={(e) => setNovaData({ ...novaData, local: e.target.value })}
            placeholder="Local"
          />
          <button onClick={handleAdd} className="btn-adicionar">
            {editando ? '✅ Salvar' : '➕ Adicionar'}
          </button>
          {editando && (
            <button onClick={() => {
              setEditando(null);
              setNovaData({ data: '', evento: '', local: '' });
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
              <th>Data</th>
              <th>Evento</th>
              <th>Local</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {datas.map(d => (
              <tr key={d.id}>
                <td>{d.data}</td>
                <td>{d.evento}</td>
                <td>{d.local}</td>
                <td>
                  <button className="btn-acao btn-editar" onClick={() => handleEdit(d)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-acao btn-deletar" onClick={() => handleDelete(d.id)}>
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
