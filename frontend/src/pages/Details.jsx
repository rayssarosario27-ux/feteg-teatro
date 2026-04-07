import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { getApiBaseUrl } from '../utils/api';
import '../styles/Details.css';
import logo from '../assets/logo.png';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = getApiBaseUrl();
  const STORAGE_KEY = 'feteg_apresentacoes';
  const [show, setShow] = useState(() => {
    const apresentada = location.state?.apresentacao;
    return apresentada && String(apresentada.id) === String(id) ? apresentada : null;
  });

  useEffect(() => {
    const apresentada = location.state?.apresentacao;
    if (apresentada && String(apresentada.id) === String(id)) {
      setShow(apresentada);
      return;
    }

    const fallback = () => {
      try {
        const local = localStorage.getItem(STORAGE_KEY);
        const lista = local ? JSON.parse(local) : [];
        if (Array.isArray(lista)) {
          const item = lista.find((ap) => String(ap.id) === String(id));
          if (item) {
            setShow(item);
            return;
          }
        }
      } catch {
        // no-op
      }
      setShow(null);
    };

    const carregar = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/apresentacoes/${id}?ts=${Date.now()}`, { cache: 'no-store' });
        if (!resposta.ok) {
          throw new Error(`Falha API: ${resposta.status}`);
        }
        const dados = await resposta.json();
        setShow(dados || null);
      } catch (error) {
        console.error('Erro ao carregar detalhes da apresentacao:', error);
        fallback();
      }
    };

    carregar();
  }, [API_URL, id, location.state]);

  if (!show) {
    return (
      <div className="details">
        <button className="btn-voltar" onClick={() => navigate('/', { replace: true })}>
          Voltar
        </button>
        <div className="container">
          <section className="sinopse">
            <h3>Apresentação não encontrada</h3>
            <p>Não foi possível carregar esta apresentação.</p>
          </section>
        </div>
      </div>
    );
  }

  const elencoList = String(show.elenco || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const locais = [
    {
      nome: show.local || 'Local a definir',
      endereco: show.endereco || 'Endereço a definir',
      datas: show.data || 'Data a definir',
      horarios: show.horario ? [show.horario] : ['Horário a definir'],
      acessibilidade: true,
      estacionamento: false
    }
  ];

  return (
    <div className="details">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="FETEG" className="logo" />
            <div>
              <h1>FETEG Teatro</h1>
            </div>
          </div>
          <input type="text" placeholder="Buscar apresentacao" className="search" name="search" id="search" />
        </div>
        <nav className="nav">
          <a href="/">Programacao</a>
          <a href="#teatros">TEATROS</a>
          <a href="#parcerias">Parcerias</a>
        </nav>
      </header>

      {/* BOTÃO VOLTAR */}
      <button
        className="btn-voltar"
        onClick={() => {
          if (location.state?.apresentacao) {
            navigate(-1);
            return;
          }

          navigate('/', { replace: true });
        }}
      >
        Voltar
      </button>

      {/* BANNER DETALHES */}
      <section className="banner-detalhes">
        <div className="banner-info">
          <h2>{show.nome}</h2>
          <div className="info-row">
            <span className="badge-class">{show.classificacao}</span>
            <span className="duracao">{show.duracao}</span>
            <span className="genero">{show.genero}</span>
          </div>
          <p className="entrada-gratis">Entrada gratuita</p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <div className="container">
        {/* SINOPSE */}
        <section className="sinopse">
          <h3>Sinopse</h3>
          <p>{show.sinopse}</p>
        </section>

        {/* AVISOS */}
        {show.avisos && (
          <section className="avisos">
            <h3>Avisos</h3>
            <p>{show.avisos}</p>
          </section>
        )}

        {/* ELENCO */}
        <section className="elenco">
          <h3>Elenco</h3>
          <ul>
            {elencoList.length > 0 ? elencoList.map((ator, idx) => (
              <li key={idx}>{ator}</li>
            )) : <li>Elenco não informado.</li>}
          </ul>
        </section>

        {/* LOCAIS E SESSÕES */}
        <section className="locais">
          <h3>Locais e Sessoes</h3>
        {locais.map((local, idx) => (
          <div key={idx} className="local-card">
            <h4>{local.nome}</h4>
            
            <div className="endereco-box">
              <FaMapMarkerAlt className="icon-endereco" />
              <div className="endereco-content">
                <strong>Endereço</strong>
                <p className="endereco">{local.endereco}</p>
              </div>
            </div>
            
            <div className="horarios-box">
              <FaClock className="icon-horario" />
              <div className="horarios-content">
                <strong>Horários:</strong>
                <div className="hora-list">
                  {local.horarios.map((hora, i) => (
                    <button key={i} className="hora-btn">
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="acessibilidade">
              {local.acessibilidade && <span className="icon">♿ Acessível</span>}
              {local.estacionamento && <span className="icon">Estacionamento</span>}
            </div>
          </div>
        ))}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          <span>&copy; 2026 FETEG Teatro</span>
          <span className="footer-sep"> | </span>
          <span className="footer-credit">Site criado por</span>
          <a
            className="footer-instagram"
            href="https://instagram.com/eng.rosarioray"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="ig-icon" /> @eng.rosarioray
          </a>
          <span className="footer-sep"> | </span>
          <span className="footer-credit">Artes em cartaz</span>
          <a
            className="footer-instagram"
            href="https://instagram.com/pedro.c.simoes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="ig-icon" /> @pedro.c.simoes
          </a>
          <span className="footer-sep"> | </span>
          <span className="footer-credit">Produtora por</span>
          <a
            className="footer-instagram"
            href="https://instagram.com/lugomesrx_"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="ig-icon" /> @lugomesrx_
          </a>
          <span className="footer-sep"> | </span>
          <span className="footer-credit">Teatro</span>
          <a
            className="footer-instagram"
            href="https://instagram.com/fetegguaranesiaoficial"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="ig-icon" /> @fetegguaranesiaoficial
          </a>
        </p>
      </footer>
    </div>
  );
}