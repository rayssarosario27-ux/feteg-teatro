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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎭 Servidor FETEG rodando na porta ${PORT}`);
});