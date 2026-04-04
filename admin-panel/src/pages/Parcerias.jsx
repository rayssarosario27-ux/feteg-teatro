import React, { useEffect, useState } from 'react';
import '../styles/Parcerias.css';

export default function Parcerias() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const STORAGE_KEY = 'feteg_parcerias';

  const parceriasPadrao = [
    { id: 1, nome: 'Prefeitura Municipal', tipo: 'Apoio' },
    { id: 2, nome: 'Banco XYZ', tipo: 'Patrocinio' },
    { id: 3, nome: 'Universidade Local', tipo: 'Apoio' },
    { id: 4, nome: 'Empresa Tech', tipo: 'Patrocinio' }
  ];

  const salvarLocal = (lista) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  };

  const lerLocal = () => {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY);
      const dados = bruto ? JSON.parse(bruto) : null;
      if (Array.isArray(dados)) return dados;
    } catch (error) {
      console.error('Erro ao ler parcerias locais:', error);
    }
    return parceriasPadrao;
  };

  const [parcerias, setParcerias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [novaParc, setNovaParc] = useState({ nome: '', tipo: 'Apoio' });
  const [editando, setEditando] = useState(null);

  const carregarParcerias = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/parcerias`);
      if (!resp.ok) {
        throw new Error(`Falha API: ${resp.status}`);
      }
      const dados = await resp.json();
      const lista = Array.isArray(dados) ? dados : [];
      setParcerias(lista);
      salvarLocal(lista);
    } catch (error) {
      console.error('Erro ao carregar parcerias:', error);
      setParcerias(lerLocal());
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarParcerias();
  }, []);

  const handleAdd = async () => {
    if (!novaParc.nome.trim()) return;

    try {
      if (editando) {
        const resposta = await fetch(`${API_URL}/api/parcerias/${editando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaParc)
        });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        setEditando(null);
      } else {
        const resposta = await fetch(`${API_URL}/api/parcerias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaParc)
        });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
      }

      setNovaParc({ nome: '', tipo: 'Apoio' });
      carregarParcerias();
    } catch (error) {
      console.error('Erro ao salvar parceria:', error);

      const base = lerLocal();
      let atualizado = base;

      if (editando) {
        atualizado = base.map((p) => (p.id === editando ? { ...p, ...novaParc } : p));
        setEditando(null);
      } else {
        atualizado = [...base, { id: Date.now(), ...novaParc }];
      }

      setParcerias(atualizado);
      salvarLocal(atualizado);
      setNovaParc({ nome: '', tipo: 'Apoio' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deletar esta parceria?')) {
      try {
        const resposta = await fetch(`${API_URL}/api/parcerias/${id}`, { method: 'DELETE' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        carregarParcerias();
      } catch (error) {
        console.error('Erro ao deletar parceria:', error);

        const atualizado = lerLocal().filter((p) => p.id !== id);
        setParcerias(atualizado);
        salvarLocal(atualizado);
      }
    }
  };

  const handleEdit = (p) => {
    setNovaParc({ nome: p.nome, tipo: p.tipo });
    setEditando(p.id);
  };

  const getTipoClasse = (tipo) => {
    return tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  return (
    <div className="parcerias-page">
      <header className="parcerias-hero">
        <div>
          <p className="parcerias-kicker">Rede Institucional</p>
          <h1>Apoios e Patrocínios</h1>
          <p className="parcerias-subtitle">Organize parceiros com clareza e mantenha a vitrine institucional sempre atualizada.</p>
        </div>
      </header>

      <div className="form-container">
        <h2>{editando ? 'Editar parceria' : 'Adicionar nova parceria'}</h2>
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
            {editando ? 'Salvar' : 'Adicionar'}
          </button>
          {editando && (
            <button onClick={() => {
              setEditando(null);
              setNovaParc({ nome: '', tipo: 'Apoio' });
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
              <th>Nome</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="3">Carregando parcerias...</td>
              </tr>
            ) : parcerias.map(p => (
              <tr key={p.id}>
                <td>{p.nome}</td>
                <td>
                  <span className={`tipo ${getTipoClasse(p.tipo)}`}>
                    {p.tipo}
                  </span>
                </td>
                <td>
                  <button className="btn-acao btn-editar" onClick={() => handleEdit(p)}>
                    Editar
                  </button>
                  <button className="btn-acao btn-deletar" onClick={() => handleDelete(p.id)}>
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
