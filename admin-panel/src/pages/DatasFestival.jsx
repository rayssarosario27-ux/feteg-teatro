import React, { useState } from 'react';
import '../styles/DatasFestival.css';

export default function DatasFestival() {
  const [datas, setDatas] = useState([
    { id: 1, data: '2026-04-15', dia: 'Terça-feira' },
    { id: 2, data: '2026-04-16', dia: 'Quarta-feira' },
    { id: 3, data: '2026-04-17', dia: 'Quinta-feira' },
    { id: 4, data: '2026-04-18', dia: 'Sexta-feira' },
    { id: 5, data: '2026-04-19', dia: 'Sábado' },
    { id: 6, data: '2026-04-20', dia: 'Domingo' }
  ]);

  const [editando, setEditando] = useState(null);
  const [novaData, setNovaData] = useState('');

  const handleEditarData = (id) => {
    const data = datas.find(d => d.id === id);
    setEditando(id);
    setNovaData(data.data);
  };

  const handleSalvarData = (id) => {
    const dataObj = new Date(novaData);
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dia = dias[dataObj.getDay()];

    setDatas(datas.map(d => 
      d.id === id ? { ...d, data: novaData, dia } : d
    ));
    setEditando(null);
  };

  const handleCancelar = () => {
    setEditando(null);
    setNovaData('');
  };

  const handleSalvarTodas = () => {
    alert('✅ Datas do festival salvas com sucesso!');
  };

  return (
    <div className="datas-page">
      <header className="page-header">
        <h1>🎭 Festival FETEG</h1>
      </header>

      <div className="datas-container">
        <div className="datas-grid">
          {datas.map((item, idx) => (
            <div key={item.id} className="data-card">
              <div className="numero-dia">Dia {idx + 1}</div>
              
              {editando === item.id ? (
                <div className="edit-form">
                  <input
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="input-data"
                  />
                  <div className="form-actions">
                    <button 
                      className="btn-salvar"
                      onClick={() => handleSalvarData(item.id)}
                    >
                      💾 Salvar
                    </button>
                    <button 
                      className="btn-cancelar"
                      onClick={handleCancelar}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="data-display">
                    <div className="data-grande">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="dia-semana">{item.dia}</div>
                  </div>
                  <button 
                    className="btn-editar"
                    onClick={() => handleEditarData(item.id)}
                  >
                    ✏️ Editar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="btn-salvar-geral" onClick={handleSalvarTodas}>
            💾 Salvar Todas as Datas
          </button>
        </div>
      </div>
    </div>
  );
}