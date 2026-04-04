import React, { useState } from 'react';
import '../styles/Datas.css';

export default function Datas() {
  const [datas, setDatas] = useState([
    { id: 1, data: '2026-04-15', evento: 'Abertura Festival', local: 'Teatro Municipal' },
    { id: 2, data: '2026-04-16', evento: 'Romeu e Julieta', local: 'Teatro Municipal' },
    { id: 3, data: '2026-04-17', evento: 'Cinderela', local: 'Auditório Principal' },
    { id: 4, data: '2026-04-18', evento: 'Aladim', local: 'Teatro Popular' },
  ]);

  const [novaData, setNovaData] = useState({ data: '', evento: '', local: '' });
  const [editando, setEditando] = useState(null);

  const formatarData = (valor) => {
    if (!valor) return '-';
    const [ano, mes, dia] = valor.split('-');
    if (!ano || !mes || !dia) return valor;
    return `${dia}/${mes}/${ano}`;
  };

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
      <section className="datas-hero">
        <div>
          <p className="datas-kicker">Agenda Inteligente</p>
          <h1>Datas do Festival</h1>
          <p className="datas-subtitle">Visual mais limpo, leitura rápida e controle total dos eventos.</p>
        </div>
        <div className="datas-chip">{datas.length} eventos ativos</div>
      </section>

      <div className="form-container">
        <h2>{editando ? 'Editar evento' : 'Adicionar novo evento'}</h2>
        <div className="form-group">
          <div className="date-input-shell">
            <label htmlFor="nova-data">Data</label>
            <input
              id="nova-data"
              type="date"
              value={novaData.data}
              onChange={(e) => setNovaData({ ...novaData, data: e.target.value })}
            />
          </div>
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
            {editando ? 'Salvar' : 'Adicionar'}
          </button>
          {editando && (
            <button onClick={() => {
              setEditando(null);
              setNovaData({ data: '', evento: '', local: '' });
            }} className="btn-cancelar">
              Cancelar
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
                <td>{formatarData(d.data)}</td>
                <td>{d.evento}</td>
                <td>{d.local}</td>
                <td>
                  <button className="btn-acao btn-editar" onClick={() => handleEdit(d)}>
                    Editar
                  </button>
                  <button className="btn-acao btn-deletar" onClick={() => handleDelete(d.id)}>
                    Deletar
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
