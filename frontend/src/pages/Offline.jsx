import React from 'react';
import logo from '../assets/logo.png';
import '../styles/Home.css';

const frasesTeatrais = [
  '“O teatro é a poesia que sai do livro e se faz humana.” – Federico García Lorca',
  '“A arte existe porque a vida não basta.” – Ferreira Gullar',
  '“O teatro é o exercício do encontro.” – Augusto Boal',
  '“A vida é uma peça de teatro que não permite ensaios.” – Charles Chaplin',
  '“No palco, a alma se revela.”',
  '“O teatro é o agora eterno.”',
];

export default function Offline() {
  const frase = frasesTeatrais[Math.floor(Math.random() * frasesTeatrais.length)];
  return (
    <main className="home-empty" aria-live="polite">
      <div className="empty-glow empty-glow-left" />
      <div className="empty-glow empty-glow-right" />
      <section className="empty-stage">
        <img src={logo} alt="FETEG" style={{ width: 120, marginBottom: 16 }} />
        <p className="empty-kicker">FETEG</p>
        <h1>Site temporariamente fora do ar</h1>
        <p className="empty-subtitle">
          Estamos em manutenção ou atualização. Em breve, o festival volta ao palco digital!
        </p>
        <blockquote style={{ fontStyle: 'italic', margin: '32px 0', color: '#ff6b00' }}>{frase}</blockquote>
        <div className="empty-actions">
          <a className="empty-link" href="https://instagram.com/fetegguaranesiaoficial" target="_blank" rel="noopener noreferrer">
            Siga novidades no Instagram
          </a>
        </div>
      </section>
    </main>
  );
}
