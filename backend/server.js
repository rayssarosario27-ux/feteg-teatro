const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rota teste
app.get('/api', (req, res) => {
  res.json({ 
    mensagem: 'FETEG Teatro API funcionando!',
    status: 'online'
  });
});

// Rota: Listar apresentações
app.get('/api/apresentacoes', (req, res) => {
  res.json([
    { id: 1, nome: 'Romeu e Julieta', classificacao: '12', hora: '19:00' },
    { id: 2, nome: 'Cinderela', classificacao: 'L', hora: '19:30' },
    { id: 3, nome: 'Aladim', classificacao: '10', hora: '14:00' },
    { id: 4, nome: 'Frozen', classificacao: 'L', hora: '21:00' },
    { id: 5, nome: 'Hercules', classificacao: 'L', hora: '20:00' },
    { id: 6, nome: 'Show BTS', classificacao: '?', hora: '19:30' }
  ]);
});

let parcerias = [
  { id: 1, nome: 'Prefeitura Municipal', tipo: 'Apoio' },
  { id: 2, nome: 'Banco XYZ', tipo: 'Patrocinio' },
  { id: 3, nome: 'Universidade Local', tipo: 'Apoio' },
  { id: 4, nome: 'Empresa Tech', tipo: 'Patrocinio' }
];

app.get('/api/parcerias', (req, res) => {
  res.json(parcerias);
});

app.post('/api/parcerias', (req, res) => {
  const { nome, tipo } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'nome e tipo sao obrigatorios' });
  }

  const nova = {
    id: Date.now(),
    nome: String(nome).trim(),
    tipo: String(tipo).trim()
  };

  parcerias.push(nova);
  return res.status(201).json(nova);
});

app.put('/api/parcerias/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nome, tipo } = req.body;

  const idx = parcerias.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ erro: 'parceria nao encontrada' });
  }

  parcerias[idx] = {
    ...parcerias[idx],
    nome: nome ? String(nome).trim() : parcerias[idx].nome,
    tipo: tipo ? String(tipo).trim() : parcerias[idx].tipo
  };

  return res.json(parcerias[idx]);
});

app.delete('/api/parcerias/:id', (req, res) => {
  const id = Number(req.params.id);
  const existe = parcerias.some((p) => p.id === id);

  if (!existe) {
    return res.status(404).json({ erro: 'parceria nao encontrada' });
  }

  parcerias = parcerias.filter((p) => p.id !== id);
  return res.status(204).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎭 Servidor FETEG rodando na porta ${PORT}`);
});