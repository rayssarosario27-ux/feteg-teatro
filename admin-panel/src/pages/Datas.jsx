import React, { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/Datas.css';

export default function Datas() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [datas, setDatas] = useState([]);
  const [novaData, setNovaData] = useState({ data: '' });
  const [editando, setEditando] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, deleteId: null });

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

  const formatarData = (valor) => {
    if (!valor) return '-';
    const [ano, mes, dia] = valor.split('-');
    if (!ano || !mes || !dia) return valor;
    return `${dia}/${mes}/${ano}`;
  };

  const calcularDiaSemana = (valor) => {
    if (!valor) return '';
    const dataObj = new Date(`${valor}T00:00:00`);
    if (Number.isNaN(dataObj.getTime())) return '';
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[dataObj.getDay()];
  };

  const handleAdd = async () => {
    if (novaData.data) {
      const payload = { data: novaData.data, dia: calcularDiaSemana(novaData.data) };

      try {
        if (editando) {
          const resposta = await fetch(`${API_URL}/api/datas/${editando}`, {
            method: 'PUT',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!resposta.ok) throw new Error(`Falha API: ${resposta.status}`);

          const atualizado = await resposta.json();
          setDatas((atual) => atual.map((d) => (d.id === editando ? atualizado : d)));
          setEditando(null);
        } else {
          const resposta = await fetch(`${API_URL}/api/datas`, {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!resposta.ok) throw new Error(`Falha API: ${resposta.status}`);

          const criado = await resposta.json();
          setDatas((atual) => [...atual, criado]);
        }

        setNovaData({ data: '' });
      } catch (error) {
        console.error('Erro ao salvar data:', error);
        alert('Nao foi possivel salvar a data.');
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
      const resposta = await fetch(`${API_URL}/api/datas/${id}`, { method: 'DELETE', cache: 'no-store' });
      if (!resposta.ok && resposta.status !== 204) {
        throw new Error(`Falha API: ${resposta.status}`);
      }
      setDatas((atual) => atual.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Erro ao deletar data:', error);
      alert('Nao foi possivel deletar a data.');
    }
  };

  const handleEdit = (d) => {
    setNovaData({ data: d.data });
    setEditando(d.id);
  };

  return (
    <div className="datas-page">
      <section className="datas-hero">
        <div>
          <p className="datas-kicker">Agenda Inteligente</p>
          <h1>Datas do Festival</h1>
          <p className="datas-subtitle">Visual mais limpo, leitura rápida e controle total dos dias do festival.</p>
        </div>
        <div className="datas-chip">{datas.length} datas ativas</div>
      </section>

      <div className="form-container">
        <h2>{editando ? 'Editar data' : 'Adicionar nova data'}</h2>
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
          <button onClick={handleAdd} className="btn-adicionar">
            {editando ? 'Salvar' : 'Adicionar'}
          </button>
          {editando && (
            <button onClick={() => {
              setEditando(null);
              setNovaData({ data: '' });
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
              <th>Dia da Semana</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {datas.map(d => (
              <tr key={d.id}>
                <td>{formatarData(d.data)}</td>
                <td>{d.dia || calcularDiaSemana(d.data)}</td>
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Deletar Data?"
        message="Esta ação é irreversível. A data do festival será removida permanentemente."
        onConfirm={confirmarDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, deleteId: null })}
      />
    </div>
  );
}
