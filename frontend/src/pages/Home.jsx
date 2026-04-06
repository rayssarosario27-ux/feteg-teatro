import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { getApiBaseUrl } from '../utils/api';
import '../styles/Home.css';
import logo from '../assets/logo.png';

export default function Home() {
  const navigate = useNavigate();
  const API_URL = getApiBaseUrl();
  const STORAGE_KEY = 'feteg_parcerias';
  const AP_STORAGE_KEY = 'feteg_apresentacoes';
  const DATAS_STORAGE_KEY = 'feteg_datas';
  const anoAtual = new Date().getFullYear();

  const carregarListaCache = (chave) => {
    try {
      const bruto = localStorage.getItem(chave);
      const dados = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  };

  // Sempre tenta carregar do cache local primeiro para navegação instantânea
  const [apresentacoes, setApresentacoes] = useState([]);

  const [indiceCarousel, setIndiceCarousel] = useState(0);
  const [pesquisa, setPesquisa] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('todos');
  const [parcerias, setParcerias] = useState(() => carregarListaCache(STORAGE_KEY));
  const [datasFestival, setDatasFestival] = useState(() => carregarListaCache(DATAS_STORAGE_KEY));
  const cardsSectionRef = useRef(null);

  // Auto-play carousel
  useEffect(() => {
    if (apresentacoes.length === 0) return;

    const interval = setInterval(() => {
      setIndiceCarousel((prev) => (prev + 1) % apresentacoes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [apresentacoes.length]);

  // Sempre recarrega do localStorage ao montar (inclusive ao voltar do Details)
  useEffect(() => {
    setApresentacoes(carregarListaCache(AP_STORAGE_KEY));
  }, []);

  // Atualiza do servidor em background, mas nunca trava a tela ao voltar
  useEffect(() => {
    let cancelado = false;
    const carregarConteudoPublicado = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/publico?ts=${Date.now()}`, { cache: 'no-store' });
        if (!resposta.ok) throw new Error(`Falha API: ${resposta.status}`);
        const dados = await resposta.json();
        const apresentacoesPublicas = Array.isArray(dados.apresentacoes) ? dados.apresentacoes : [];
        const parceriasPublicas = Array.isArray(dados.parcerias) ? dados.parcerias : [];
        const datasPublicas = Array.isArray(dados.datas) ? dados.datas : [];
        // Só sobrescreve o cache se a lista da API for maior ou igual à do cache
        const cacheAtual = carregarListaCache(AP_STORAGE_KEY);
        if (!cancelado) {
          setApresentacoes(apresentacoesPublicas.length >= cacheAtual.length ? apresentacoesPublicas : cacheAtual);
          setParcerias(parceriasPublicas);
          setDatasFestival(datasPublicas);
        }
        if (apresentacoesPublicas.length >= cacheAtual.length) {
          try {
            localStorage.setItem(AP_STORAGE_KEY, JSON.stringify(apresentacoesPublicas));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parceriasPublicas));
            localStorage.setItem(DATAS_STORAGE_KEY, JSON.stringify(datasPublicas));
          } catch (storageError) {
            console.warn('Nao foi possivel salvar cache local do conteudo publicado:', storageError);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conteudo publicado:', error);
        // Não limpa o cache local, só mostra o que já tem
      }
    };
    carregarConteudoPublicado();
    return () => { cancelado = true; };
  }, [API_URL]);

  const handlePrev = () => {
    setIndiceCarousel((prev) =>
      prev === 0 ? apresentacoes.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setIndiceCarousel((prev) => (prev + 1) % apresentacoes.length);
  };

  const normalizarDia = (valor) => {
    if (!valor) return '';
    const texto = String(valor).trim();
    const partes = texto.split('-');
    if (partes.length === 3) {
      return String(Number(partes[2]));
    }
    return String(Number(texto)) || texto;
  };

  const formatarNumeroDia = (valor) => {
    if (!valor) return '';
    const partes = String(valor).split('-');
    return partes.length === 3 ? partes[2] : String(valor);
  };

  const apresentacaoAtual = apresentacoes[indiceCarousel];

  const handleSaibaMais = () => {
    if (!apresentacaoAtual) return;
    navigate(`/detalhes/${apresentacaoAtual.id}`, { state: { apresentacao: apresentacaoAtual } });
  };

  const apresentacoesFiltradas = useMemo(() => {
    const diaSelecionadoNormalizado = normalizarDia(dataSelecionada);

    return apresentacoes.filter((ap) => {
      const matchPesquisa = ap.nome.toLowerCase().includes(pesquisa.toLowerCase());
      const matchDia = dataSelecionada === 'todos' || !diaSelecionadoNormalizado || normalizarDia(ap.data) === diaSelecionadoNormalizado;
      return matchPesquisa && matchDia;
    });
  }, [apresentacoes, pesquisa, dataSelecionada]);

  const datas = useMemo(() => {
    const todas = datasFestival
      .map((item) => String(item.data || '').trim())
      .filter((valor) => valor.length > 0);
    const unicas = [...new Set(todas)];
    return ['todos', ...(unicas.length > 0 ? unicas : ['15', '16', '17', '18', '19', '20'])];
  }, [datasFestival]);

  const handlePesquisa = (valor) => {
    setPesquisa(valor);

    if (valor.trim() && cardsSectionRef.current) {
      cardsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (apresentacoes.length === 0 || !apresentacaoAtual) {
    return (
      <main className="home-empty" aria-live="polite">
        <div className="empty-glow empty-glow-left" />
        <div className="empty-glow empty-glow-right" />

        <section className="empty-stage">
          <p className="empty-kicker">FETEG {anoAtual}</p>
          <h1>Novidades em breve</h1>
          <p className="empty-subtitle">
            A próxima programação ainda está sendo preparada. Em breve, você verá aqui as peças, datas e destaques do festival.
          </p>

          <div className="empty-actions">
            <button type="button" className="empty-btn" onClick={() => window.location.reload()}>
              Atualizar página
            </button>
            <a className="empty-link" href="https://instagram.com/fetegguaranesiaoficial" target="_blank" rel="noopener noreferrer">
              Acompanhar no Instagram
            </a>
          </div>

          <div className="empty-pulses" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      </main>
    );
  }

  const getImagemCarousel = () => {
    if (apresentacaoAtual.imagemCarousel) {
      return apresentacaoAtual.imagemCarousel;
    }
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"%3E%3Crect fill="%23ff6b00" width="1200" height="500"/%3E%3Ctext x="50%25" y="50%25" font-size="64" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold"%3E${apresentacaoAtual.nome}%3C/text%3E%3C/svg%3E`;
  };

  const getPosicaoImagemCarousel = () => {
    return apresentacaoAtual.imagemCarouselPosicao || '50% 50%';
  };

  const getImagemCard = (item) => {
    if (item.imagemCard) {
      return item.imagemCard;
    }
    if (item.imagemCarousel) {
      return item.imagemCarousel;
    }
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ff6b00" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold"%3E${item.nome}%3C/text%3E%3C/svg%3E`;
  };

  const getPosicaoImagemCard = (item) => {
    return item.imagemCardPosicao || '50% 50%';
  };

  return (
    <div className="home">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="FETEG" className="logo" />
            <div>
              <h1>Festival Internacional de Teatro de Guaranesia</h1>
            </div>
          </div>
          <input
            type="text"
            placeholder="Buscar apresentação"
            className="search"
            value={pesquisa}
            onChange={(e) => handlePesquisa(e.target.value)}
          />
        </div>
        <nav className="nav">
          <a href="#prog">PROGRAMAÇÃO</a>
          <a href="#parc">PARCERIAS</a>
        </nav>
      </header>

      {/* CAROUSEL HERO */}
      <section className="carousel-hero" id="prog">
        <img
          src={getImagemCarousel()}
          alt={apresentacaoAtual.nome}
          className="carousel-img"
          style={{ objectPosition: getPosicaoImagemCarousel() }}
        />
        <div className="carousel-overlay"></div>

        <div className="carousel-content">
          <p className="hero-kicker">Destaque</p>
          <h2>{apresentacaoAtual.nome}</h2>
          <p>{apresentacaoAtual.genero}</p>
          <button className="btn-saiba" onClick={handleSaibaMais}>
            Ver detalhes
          </button>
        </div>

        <button className="carousel-btn prev" onClick={handlePrev}>❮</button>
        <button className="carousel-btn next" onClick={handleNext}>❯</button>

        <div className="carousel-nav">
          {apresentacoes.map((_, i) => (
            <button
              key={i}
              className={`nav-dot ${i === indiceCarousel ? 'active' : ''}`}
              onClick={() => setIndiceCarousel(i)}
            />
          ))}
        </div>

        <div className="carousel-counter">
          {indiceCarousel + 1} / {apresentacoes.length}
        </div>
      </section>

      {/* SELETOR DE DATAS */}
      <section className="dates-section">
        <div className="dates-box">
          <h3>Selecione uma Data</h3>
          <div className="date-display">
            <span className="date-day">{dataSelecionada === 'todos' ? 'Todos' : formatarNumeroDia(dataSelecionada)}</span>
            <span className="date-info">{dataSelecionada === 'todos' ? 'Todas as apresentações' : `Abril · ${anoAtual}`}</span>
          </div>
          <div className="dates-buttons">
            {datas.map((data) => (
              <button
                key={data}
                className={`date-btn ${dataSelecionada === data ? 'active' : ''}`}
                onClick={() => setDataSelecionada(data)}
              >
                {data === 'todos' ? 'Todos' : formatarNumeroDia(data)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CARDS GRID */}
      <section className="cards-section" ref={cardsSectionRef}>
        <h2>Em Cartaz</h2>
        <div className="cards-container">
          {apresentacoesFiltradas.length > 0 ? (
            apresentacoesFiltradas.map((item, idx) => (
              <Link
                to={`/detalhes/${item.id}`}
                state={{ apresentacao: item }}
                key={item.id}
                className="card"
              >
                <div className="card-image-wrapper">
                  <img
                    src={getImagemCard(item)}
                    alt={item.nome}
                    className="card-img"
                    style={{ objectPosition: getPosicaoImagemCard(item) }}
                  />
                  <span className="card-number">{idx + 1}</span>
                  <span className="card-classificacao">{item.classificacao}</span>
                </div>
                <div className="card-content">
                  <h3>{item.nome}</h3>
                  <p className="card-genre">{item.genero}</p>
                  <div className="card-meta">
                    <span>{item.duracao} min</span>
                    <span>{item.local}</span>
                  </div>
                  <p className="card-free">Entrada gratuita</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="cards-empty">
              Nenhuma apresentação encontrada para esta data.
            </p>
          )}
        </div>
      </section>

      <section className="partners-section" id="parc">
        <div className="partners-header">
          <h2>Parcerias</h2>
          <p>Instituições e apoiadores que fortalecem o festival.</p>
        </div>

        <div className="partners-grid">
          {parcerias.length > 0 ? (
            parcerias.map((parceria) => (
              <article key={parceria.id} className="partner-card">
                <span className={`partner-tag ${parceria.tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>
                  {parceria.tipo}
                </span>
                <h3>{parceria.nome}</h3>
              </article>
            ))
          ) : (
            <p className="partners-empty">Nenhuma parceria cadastrada no momento.</p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          <span>&copy; {anoAtual} Festival Internacional de Teatro de Guaranesia</span>
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
          <span className="footer-credit">Produção por</span>
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
