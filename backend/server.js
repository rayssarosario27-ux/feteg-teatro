const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()).filter(Boolean)
  : [];

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Middleware CORS
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (corsOrigin.includes(origin) || localhostOriginPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS nao permitido para esta origem'));
  },
  credentials: true,
}));
// Fallback manual para garantir headers em serverless (Vercel)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    !origin ||
    corsOrigin.includes(origin) ||
    localhostOriginPattern.test(origin)
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const mapApresentacao = (row) => ({
  id: row.id,
  nome: row.nome,
  classificacao: row.classificacao,
  duracao: row.duracao,
  genero: row.genero,
  data: row.data,
  horario: row.horario || '',
  status: row.status,
  local: row.local,
  endereco: row.endereco,
  sinopse: row.sinopse,
  elenco: row.elenco,
  avisos: row.avisos,
  dataInicio: row.data_inicio,
  dataFim: row.data_fim,
  imagemCard: row.imagem_card,
  imagemCardPosicao: row.imagem_card_posicao || '50% 50%',
  imagemCarousel: row.imagem_carousel,
  imagemCarouselPosicao: row.imagem_carousel_posicao || '50% 50%',
  viewsCount: row.views_count || 0
});

const mapDataFestival = (row) => ({
  id: row.id,
  data: row.data,
  evento: row.evento,
  local: row.local,
  dia: row.dia
});

async function buildPublicPayload() {
  const [apresentacoesResult, parceriasResult, datasResult] = await Promise.all([
    pool.query('SELECT * FROM apresentacoes ORDER BY id'),
    pool.query('SELECT id, nome, tipo FROM parcerias ORDER BY id'),
    pool.query('SELECT id, data, evento, local, dia FROM datas_festival ORDER BY data, id')
  ]);

  return {
    apresentacoes: apresentacoesResult.rows.map(mapApresentacao),
    parcerias: parceriasResult.rows,
    datas: datasResult.rows.map(mapDataFestival)
  };
}

function getEmptyPublicPayload() {
  return {
    apresentacoes: [],
    parcerias: [],
    datas: []
  };
}

function normalizePublicPayload(payload) {
  const base = payload && typeof payload === 'object' ? payload : {};
  return {
    apresentacoes: Array.isArray(base.apresentacoes) ? base.apresentacoes : [],
    parcerias: Array.isArray(base.parcerias) ? base.parcerias : [],
    datas: Array.isArray(base.datas) ? base.datas : []
  };
}

async function publicarSite() {
  const payload = await buildPublicPayload();

  const result = await pool.query(
    `INSERT INTO public_site_snapshot (id, payload, published_at, published_by_admin)
     VALUES (1, $1::jsonb, NOW(), TRUE)
     ON CONFLICT (id)
     DO UPDATE SET payload = EXCLUDED.payload, published_at = NOW(), published_by_admin = TRUE
     RETURNING id, payload, published_at, published_by_admin`,
    [JSON.stringify(payload)]
  );

  return result.rows[0];
}

async function tirarSiteDoAr() {
  const payloadVazio = getEmptyPublicPayload();

  const result = await pool.query(
    `INSERT INTO public_site_snapshot (id, payload, published_at, published_by_admin)
     VALUES (1, $1::jsonb, NOW(), FALSE)
     ON CONFLICT (id)
     DO UPDATE SET payload = EXCLUDED.payload, published_at = NOW(), published_by_admin = FALSE
     RETURNING id, payload, published_at, published_by_admin`,
    [JSON.stringify(payloadVazio)]
  );

  return result.rows[0];
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS apresentacoes (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      classificacao TEXT DEFAULT '',
      duracao TEXT DEFAULT '',
      genero TEXT DEFAULT '',
      data TEXT DEFAULT '',
      horario TEXT DEFAULT '',
      status TEXT DEFAULT 'ativo',
      local TEXT DEFAULT '',
      endereco TEXT DEFAULT '',
      sinopse TEXT DEFAULT '',
      elenco TEXT DEFAULT '',
      avisos TEXT DEFAULT '',
      data_inicio TEXT DEFAULT '',
      data_fim TEXT DEFAULT '',
      imagem_card TEXT,
      imagem_card_posicao TEXT DEFAULT '50% 50%',
      imagem_carousel TEXT,
      imagem_carousel_posicao TEXT DEFAULT '50% 50%',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE apresentacoes
    ADD COLUMN IF NOT EXISTS imagem_card_posicao TEXT DEFAULT '50% 50%';
  `);

  await pool.query(`
    ALTER TABLE apresentacoes
    ADD COLUMN IF NOT EXISTS imagem_carousel_posicao TEXT DEFAULT '50% 50%';
  `);

  await pool.query(`
    ALTER TABLE apresentacoes
    ADD COLUMN IF NOT EXISTS horario TEXT DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE apresentacoes
    ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS parcerias (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS datas_festival (
      id SERIAL PRIMARY KEY,
      data TEXT NOT NULL,
      evento TEXT NOT NULL,
      local TEXT NOT NULL,
      dia TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public_site_snapshot (
      id INTEGER PRIMARY KEY,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      published_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT public_site_snapshot_single_row CHECK (id = 1)
    );
  `);

  await pool.query(`
    ALTER TABLE public_site_snapshot
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
  `);

  await pool.query(`
    ALTER TABLE public_site_snapshot
    ADD COLUMN IF NOT EXISTS published_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await pool.query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS set_apresentacoes_updated_at ON apresentacoes;
    CREATE TRIGGER set_apresentacoes_updated_at
    BEFORE UPDATE ON apresentacoes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS set_parcerias_updated_at ON parcerias;
    CREATE TRIGGER set_parcerias_updated_at
    BEFORE UPDATE ON parcerias
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS set_datas_festival_updated_at ON datas_festival;
    CREATE TRIGGER set_datas_festival_updated_at
    BEFORE UPDATE ON datas_festival
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS set_public_site_snapshot_updated_at ON public_site_snapshot;
    CREATE TRIGGER set_public_site_snapshot_updated_at
    BEFORE UPDATE ON public_site_snapshot
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  const publicSnapshotCount = await pool.query('SELECT COUNT(*)::int AS total FROM public_site_snapshot');
  if (publicSnapshotCount.rows[0].total === 0) {
    await pool.query(
      `INSERT INTO public_site_snapshot (id, payload, published_at, published_by_admin)
       VALUES (1, $1::jsonb, NOW(), FALSE)`,
      [JSON.stringify(getEmptyPublicPayload())]
    );
  }

  await pool.query(
    `UPDATE public_site_snapshot
     SET payload = $1::jsonb, published_at = NOW()
     WHERE id = 1 AND COALESCE(published_by_admin, FALSE) = FALSE`,
    [JSON.stringify(getEmptyPublicPayload())]
  );
}

// Rota teste
app.get('/api', (req, res) => {
  res.json({ 
    mensagem: 'FETEG Teatro API funcionando!',
    status: 'online'
  });
});

app.get('/api/publico', async (req, res) => {
  try {
    const result = await pool.query('SELECT payload, published_at, published_by_admin FROM public_site_snapshot WHERE id = 1');
    if (result.rowCount === 0) {
      const emptyPayload = getEmptyPublicPayload();
      await pool.query(
        `INSERT INTO public_site_snapshot (id, payload, published_at, published_by_admin)
         VALUES (1, $1::jsonb, NOW(), FALSE)
         ON CONFLICT (id) DO NOTHING`,
        [JSON.stringify(emptyPayload)]
      );
      return res.json({
        ...emptyPayload,
        publishedAt: null,
        publishedByAdmin: false
      });
    }

    const payloadNormalizado = normalizePublicPayload(result.rows[0].payload);

    return res.json({
      ...payloadNormalizado,
      publishedAt: result.rows[0].published_at,
      publishedByAdmin: Boolean(result.rows[0].published_by_admin)
    });
  } catch (error) {
    console.error('Erro ao obter snapshot publico:', error);
    return res.status(500).json({ erro: 'falha ao obter snapshot publico' });
  }
});

app.post('/api/publicar-site', async (req, res) => {
  try {
    // Força uso do payload enviado pelo admin
    const payload = req.body && Object.keys(req.body).length > 0
      ? req.body
      : getEmptyPublicPayload();

    const result = await pool.query(
      `INSERT INTO public_site_snapshot (id, payload, published_at, published_by_admin)
       VALUES (1, $1::jsonb, NOW(), TRUE)
       ON CONFLICT (id)
       DO UPDATE SET payload = EXCLUDED.payload, published_at = NOW(), published_by_admin = TRUE
       RETURNING id, payload, published_at, published_by_admin`,
      [JSON.stringify(payload)]
    );

    return res.json({
      mensagem: 'Atualizacao publicada com sucesso',
      publishedAt: result.rows[0].published_at,
      publishedByAdmin: Boolean(result.rows[0].published_by_admin)
    });
  } catch (error) {
    console.error('Erro ao publicar site:', error);
    return res.status(500).json({ erro: 'falha ao publicar site' });
  }
});

app.post('/api/tirar-site-do-ar', async (req, res) => {
  try {
    const resultado = await tirarSiteDoAr();
    return res.json({
      mensagem: 'Atualizacao retirada do ar com sucesso',
      publishedAt: resultado.published_at,
      publishedByAdmin: Boolean(resultado.published_by_admin)
    });
  } catch (error) {
    console.error('Erro ao tirar site do ar:', error);
    return res.status(500).json({ erro: 'falha ao tirar site do ar' });
  }
});

// Rota: Listar apresentações
app.get('/api/apresentacoes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM apresentacoes ORDER BY id');
    return res.json(result.rows.map(mapApresentacao));
  } catch (error) {
    console.error('Erro ao listar apresentacoes:', error);
    return res.status(500).json({ erro: 'falha ao listar apresentacoes' });
  }
});

app.get('/api/apresentacoes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  try {
    const result = await pool.query('SELECT * FROM apresentacoes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'apresentacao nao encontrada' });
    }
    return res.json(mapApresentacao(result.rows[0]));
  } catch (error) {
    console.error('Erro ao buscar apresentacao:', error);
    return res.status(500).json({ erro: 'falha ao buscar apresentacao' });
  }
});

app.post('/api/apresentacoes', async (req, res) => {
  const {
    nome,
    classificacao = '',
    duracao = '',
    genero = '',
    data = '',
    horario = '',
    status = 'ativo',
    local = '',
    endereco = '',
    sinopse = '',
    elenco = '',
    avisos = '',
    dataInicio = '',
    dataFim = '',
    imagemCard = null,
    imagemCardPosicao = '50% 50%',
    imagemCarousel = null,
    imagemCarouselPosicao = '50% 50%'
  } = req.body;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({ erro: 'nome e obrigatorio' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO apresentacoes
        (nome, classificacao, duracao, genero, data, horario, status, local, endereco, sinopse, elenco, avisos, data_inicio, data_fim, imagem_card, imagem_card_posicao, imagem_carousel, imagem_carousel_posicao)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        String(nome).trim(),
        String(classificacao),
        String(duracao),
        String(genero),
        String(data),
        String(horario),
        String(status),
        String(local),
        String(endereco),
        String(sinopse),
        String(elenco),
        String(avisos),
        String(dataInicio),
        String(dataFim),
        imagemCard,
        String(imagemCardPosicao || '50% 50%'),
        imagemCarousel,
        String(imagemCarouselPosicao || '50% 50%')
      ]
    );

    return res.status(201).json(mapApresentacao(result.rows[0]));
  } catch (error) {
    console.error('Erro ao criar apresentacao:', error);
    return res.status(500).json({ erro: 'falha ao criar apresentacao' });
  }
});

app.put('/api/apresentacoes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  try {
    const atual = await pool.query('SELECT * FROM apresentacoes WHERE id = $1', [id]);
    if (atual.rowCount === 0) {
      return res.status(404).json({ erro: 'apresentacao nao encontrada' });
    }

    const base = mapApresentacao(atual.rows[0]);
    const payload = {
      nome: req.body.nome ?? base.nome,
      classificacao: req.body.classificacao ?? base.classificacao,
      duracao: req.body.duracao ?? base.duracao,
      genero: req.body.genero ?? base.genero,
      data: req.body.data ?? base.data,
      horario: req.body.horario ?? base.horario,
      status: req.body.status ?? base.status,
      local: req.body.local ?? base.local,
      endereco: req.body.endereco ?? base.endereco,
      sinopse: req.body.sinopse ?? base.sinopse,
      elenco: req.body.elenco ?? base.elenco,
      avisos: req.body.avisos ?? base.avisos,
      dataInicio: req.body.dataInicio ?? base.dataInicio,
      dataFim: req.body.dataFim ?? base.dataFim,
      imagemCard: req.body.imagemCard ?? base.imagemCard,
      imagemCardPosicao: req.body.imagemCardPosicao ?? base.imagemCardPosicao,
      imagemCarousel: req.body.imagemCarousel ?? base.imagemCarousel,
      imagemCarouselPosicao: req.body.imagemCarouselPosicao ?? base.imagemCarouselPosicao
    };

    const result = await pool.query(
      `UPDATE apresentacoes SET
        nome = $1,
        classificacao = $2,
        duracao = $3,
        genero = $4,
        data = $5,
        horario = $6,
        status = $7,
        local = $8,
        endereco = $9,
        sinopse = $10,
        elenco = $11,
        avisos = $12,
        data_inicio = $13,
        data_fim = $14,
        imagem_card = $15,
           imagem_card_posicao = $16,
           imagem_carousel = $17,
           imagem_carousel_posicao = $18
             WHERE id = $19
       RETURNING *`,
      [
        String(payload.nome),
        String(payload.classificacao),
        String(payload.duracao),
        String(payload.genero),
        String(payload.data),
        String(payload.horario),
        String(payload.status),
        String(payload.local),
        String(payload.endereco),
        String(payload.sinopse),
        String(payload.elenco),
        String(payload.avisos),
        String(payload.dataInicio),
        String(payload.dataFim),
        payload.imagemCard,
        String(payload.imagemCardPosicao || '50% 50%'),
        payload.imagemCarousel,
        String(payload.imagemCarouselPosicao || '50% 50%'),
        id
      ]
    );

    return res.json(mapApresentacao(result.rows[0]));
  } catch (error) {
    console.error('Erro ao atualizar apresentacao:', error);
    return res.status(500).json({ erro: 'falha ao atualizar apresentacao' });
  }
});

app.delete('/api/apresentacoes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  try {
    const result = await pool.query('DELETE FROM apresentacoes WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'apresentacao nao encontrada' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar apresentacao:', error);
    return res.status(500).json({ erro: 'falha ao deletar apresentacao' });
  }
});

app.get('/api/parcerias', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, tipo FROM parcerias ORDER BY id');
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar parcerias:', error);
    return res.status(500).json({ erro: 'falha ao listar parcerias' });
  }
});

app.post('/api/parcerias', async (req, res) => {
  const { nome, tipo } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'nome e tipo sao obrigatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO parcerias (nome, tipo) VALUES ($1, $2) RETURNING id, nome, tipo',
      [String(nome).trim(), String(tipo).trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar parceria:', error);
    return res.status(500).json({ erro: 'falha ao criar parceria' });
  }
});

app.put('/api/parcerias/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, tipo } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  try {
    const atual = await pool.query('SELECT id, nome, tipo FROM parcerias WHERE id = $1', [id]);
    if (atual.rowCount === 0) {
      return res.status(404).json({ erro: 'parceria nao encontrada' });
    }

    const result = await pool.query(
      'UPDATE parcerias SET nome = $1, tipo = $2 WHERE id = $3 RETURNING id, nome, tipo',
      [
        nome ? String(nome).trim() : atual.rows[0].nome,
        tipo ? String(tipo).trim() : atual.rows[0].tipo,
        id
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar parceria:', error);
    return res.status(500).json({ erro: 'falha ao atualizar parceria' });
  }
});

app.delete('/api/parcerias/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  try {
    const result = await pool.query('DELETE FROM parcerias WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'parceria nao encontrada' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar parceria:', error);
    return res.status(500).json({ erro: 'falha ao deletar parceria' });
  }
});

app.get('/api/datas', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, data, evento, local, dia FROM datas_festival ORDER BY data, id');
    return res.json(result.rows.map(mapDataFestival));
  } catch (error) {
    console.error('Erro ao listar datas:', error);
    return res.status(500).json({ erro: 'falha ao listar datas' });
  }
});

app.post('/api/datas', async (req, res) => {
  const { data, evento = '', local = '', dia = '' } = req.body;

  if (!data) {
    return res.status(400).json({ erro: 'data e obrigatoria' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO datas_festival (data, evento, local, dia) VALUES ($1, $2, $3, $4) RETURNING id, data, evento, local, dia',
      [String(data), String(evento).trim(), String(local).trim(), String(dia).trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar data:', error);
    return res.status(500).json({ erro: 'falha ao criar data' });
  }
});

app.put('/api/datas/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  const { data, evento, local, dia } = req.body;

  try {
    const atual = await pool.query('SELECT id, data, evento, local, dia FROM datas_festival WHERE id = $1', [id]);
    if (atual.rowCount === 0) {
      return res.status(404).json({ erro: 'data nao encontrada' });
    }

    const result = await pool.query(
      `UPDATE datas_festival SET
        data = $1,
        evento = $2,
        local = $3,
        dia = $4
       WHERE id = $5
       RETURNING id, data, evento, local, dia`,
      [
        data ?? atual.rows[0].data,
        evento ?? atual.rows[0].evento,
        local ?? atual.rows[0].local,
        dia ?? atual.rows[0].dia,
        id
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar data:', error);
    return res.status(500).json({ erro: 'falha ao atualizar data' });
  }
});

app.delete('/api/datas/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'id invalido' });
  }

  try {
    const result = await pool.query('DELETE FROM datas_festival WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'data nao encontrada' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar data:', error);
    return res.status(500).json({ erro: 'falha ao deletar data' });
  }
});

const shouldInitDb = process.env.INIT_DB === 'true';

(async () => {
  try {
    if (shouldInitDb) {
      await initDb();
    }

    app.listen(PORT, () => {
      console.log(`🎭 Servidor FETEG rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar:', error);
    process.exit(1);
  }
})();