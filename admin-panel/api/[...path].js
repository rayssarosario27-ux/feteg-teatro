import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const vercelOriginPattern = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i;

let initPromise;

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  return new Set(configuredOrigins);
}

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.has(origin)) {
    return true;
  }

  if (localOriginPattern.test(origin)) {
    return true;
  }

  return vercelOriginPattern.test(origin);
}

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, payload, req) {
  applyCorsHeaders(req, res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sendEmpty(res, statusCode, req) {
  applyCorsHeaders(req, res);
  res.statusCode = statusCode;
  res.end();
}

function mapApresentacao(row) {
  return {
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
    imagemCarouselPosicao: row.imagem_carousel_posicao || '50% 50%'
  };
}

function mapDataFestival(row) {
  return {
    id: row.id,
    data: row.data,
    evento: row.evento,
    local: row.local,
    dia: row.dia
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
      views_count INTEGER DEFAULT 0,
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

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      return req.body;
    }

    if (Buffer.isBuffer(req.body)) {
      return req.body.toString('utf8');
    }

    if (typeof req.body === 'object') {
      return JSON.stringify(req.body);
    }
  }

  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function parseJsonBody(req) {
  const rawBody = await readBody(req);

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    const error = new Error('invalid_json');
    error.statusCode = 400;
    throw error;
  }
}

function getRouteSegments(pathname) {
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'api') {
    return parts.slice(1);
  }

  return parts;
}

async function ensureDbReady() {
  if (!initPromise) {
    initPromise = initDb().catch((error) => {
      initPromise = undefined;
      throw error;
    });
  }

  return initPromise;
}

export default async function handler(req, res) {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return sendEmpty(res, 204, req);
  }

  if (!process.env.DATABASE_URL) {
    return sendJson(res, 500, { erro: 'DATABASE_URL nao configurado' }, req);
  }

  try {
    await ensureDbReady();
  } catch (error) {
    console.error('Falha ao iniciar banco de dados:', error);
    return sendJson(res, 500, { erro: 'falha ao iniciar banco de dados' }, req);
  }

  const url = new URL(req.url, 'http://localhost');
  const routeSegments = getRouteSegments(url.pathname);

  if (routeSegments.length === 0) {
    return sendJson(res, 200, {
      mensagem: 'FETEG Teatro API funcionando!',
      status: 'online'
    }, req);
  }

  const [resource, idOrAction] = routeSegments;

  try {
    if (resource === 'publico' && req.method === 'GET') {
      const result = await pool.query('SELECT payload, published_at, published_by_admin FROM public_site_snapshot WHERE id = 1');

      if (result.rowCount === 0) {
        const emptyPayload = getEmptyPublicPayload();
        await pool.query(
          `INSERT INTO public_site_snapshot (id, payload, published_at, published_by_admin)
           VALUES (1, $1::jsonb, NOW(), FALSE)
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(emptyPayload)]
        );

        return sendJson(res, 200, {
          ...emptyPayload,
          publishedAt: null,
          publishedByAdmin: false
        }, req);
      }

      const payloadNormalizado = normalizePublicPayload(result.rows[0].payload);

      return sendJson(res, 200, {
        ...payloadNormalizado,
        publishedAt: result.rows[0].published_at,
        publishedByAdmin: Boolean(result.rows[0].published_by_admin)
      }, req);
    }

    if (resource === 'publicar-site' && req.method === 'POST') {
      const publicado = await publicarSite();
      return sendJson(res, 200, {
        mensagem: 'Atualizacao publicada com sucesso',
        publishedAt: publicado.published_at,
        publishedByAdmin: Boolean(publicado.published_by_admin)
      }, req);
    }

    if (resource === 'tirar-site-do-ar' && req.method === 'POST') {
      const resultado = await tirarSiteDoAr();
      return sendJson(res, 200, {
        mensagem: 'Atualizacao retirada do ar com sucesso',
        publishedAt: resultado.published_at,
        publishedByAdmin: Boolean(resultado.published_by_admin)
      }, req);
    }

    if (resource === 'apresentacoes') {
      if (req.method === 'GET' && !idOrAction) {
        const result = await pool.query('SELECT * FROM apresentacoes ORDER BY id');
        return sendJson(res, 200, result.rows.map(mapApresentacao), req);
      }

      if (req.method === 'POST' && !idOrAction) {
        const body = await parseJsonBody(req);
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
        } = body;

        if (!nome || !String(nome).trim()) {
          return sendJson(res, 400, { erro: 'nome e obrigatorio' }, req);
        }

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

        return sendJson(res, 201, mapApresentacao(result.rows[0]), req);
      }

      if (routeSegments.length === 3 && routeSegments[2] === 'view' && req.method === 'POST') {
        const id = Number(routeSegments[1]);

        if (!Number.isInteger(id)) {
          return sendJson(res, 400, { erro: 'id invalido' }, req);
        }

        const result = await pool.query(
          'UPDATE apresentacoes SET views_count = views_count + 1 WHERE id = $1 RETURNING views_count',
          [id]
        );

        if (result.rowCount === 0) {
          return sendJson(res, 404, { erro: 'apresentacao nao encontrada' }, req);
        }

        return sendJson(res, 200, { viewsCount: result.rows[0].views_count }, req);
      }

      if (!idOrAction) {
        return sendJson(res, 404, { erro: 'rota nao encontrada' }, req);
      }

      const id = Number(idOrAction);
      if (!Number.isInteger(id)) {
        return sendJson(res, 400, { erro: 'id invalido' }, req);
      }

      if (req.method === 'GET') {
        const result = await pool.query('SELECT * FROM apresentacoes WHERE id = $1', [id]);
        if (result.rowCount === 0) {
          return sendJson(res, 404, { erro: 'apresentacao nao encontrada' }, req);
        }
        return sendJson(res, 200, mapApresentacao(result.rows[0]), req);
      }

      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        const atual = await pool.query('SELECT * FROM apresentacoes WHERE id = $1', [id]);
        if (atual.rowCount === 0) {
          return sendJson(res, 404, { erro: 'apresentacao nao encontrada' }, req);
        }

        const base = mapApresentacao(atual.rows[0]);
        const payload = {
          nome: body.nome ?? base.nome,
          classificacao: body.classificacao ?? base.classificacao,
          duracao: body.duracao ?? base.duracao,
          genero: body.genero ?? base.genero,
          data: body.data ?? base.data,
          horario: body.horario ?? base.horario,
          status: body.status ?? base.status,
          local: body.local ?? base.local,
          endereco: body.endereco ?? base.endereco,
          sinopse: body.sinopse ?? base.sinopse,
          elenco: body.elenco ?? base.elenco,
          avisos: body.avisos ?? base.avisos,
          dataInicio: body.dataInicio ?? base.dataInicio,
          dataFim: body.dataFim ?? base.dataFim,
          imagemCard: body.imagemCard ?? base.imagemCard,
          imagemCardPosicao: body.imagemCardPosicao ?? base.imagemCardPosicao,
          imagemCarousel: body.imagemCarousel ?? base.imagemCarousel,
          imagemCarouselPosicao: body.imagemCarouselPosicao ?? base.imagemCarouselPosicao
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

        return sendJson(res, 200, mapApresentacao(result.rows[0]), req);
      }

      if (req.method === 'DELETE') {
        const result = await pool.query('DELETE FROM apresentacoes WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
          return sendJson(res, 404, { erro: 'apresentacao nao encontrada' }, req);
        }

        return sendEmpty(res, 204, req);
      }
    }

    if (resource === 'parcerias') {
      if (req.method === 'GET' && !idOrAction) {
        const result = await pool.query('SELECT id, nome, tipo FROM parcerias ORDER BY id');
        return sendJson(res, 200, result.rows, req);
      }

      if (req.method === 'POST' && !idOrAction) {
        const body = await parseJsonBody(req);
        const { nome, tipo } = body;

        if (!nome || !tipo) {
          return sendJson(res, 400, { erro: 'nome e tipo sao obrigatorios' }, req);
        }

        const result = await pool.query(
          'INSERT INTO parcerias (nome, tipo) VALUES ($1, $2) RETURNING id, nome, tipo',
          [String(nome).trim(), String(tipo).trim()]
        );

        return sendJson(res, 201, result.rows[0], req);
      }

      const id = Number(idOrAction);
      if (!Number.isInteger(id)) {
        return sendJson(res, 400, { erro: 'id invalido' }, req);
      }

      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        const { nome, tipo } = body;
        const atual = await pool.query('SELECT id, nome, tipo FROM parcerias WHERE id = $1', [id]);

        if (atual.rowCount === 0) {
          return sendJson(res, 404, { erro: 'parceria nao encontrada' }, req);
        }

        const result = await pool.query(
          'UPDATE parcerias SET nome = $1, tipo = $2 WHERE id = $3 RETURNING id, nome, tipo',
          [
            nome ? String(nome).trim() : atual.rows[0].nome,
            tipo ? String(tipo).trim() : atual.rows[0].tipo,
            id
          ]
        );

        return sendJson(res, 200, result.rows[0], req);
      }

      if (req.method === 'DELETE') {
        const result = await pool.query('DELETE FROM parcerias WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
          return sendJson(res, 404, { erro: 'parceria nao encontrada' }, req);
        }

        return sendEmpty(res, 204, req);
      }
    }

    if (resource === 'datas') {
      if (req.method === 'GET' && !idOrAction) {
        const result = await pool.query('SELECT id, data, evento, local, dia FROM datas_festival ORDER BY data, id');
        return sendJson(res, 200, result.rows.map(mapDataFestival), req);
      }

      if (req.method === 'POST' && !idOrAction) {
        const body = await parseJsonBody(req);
        const { data, evento = '', local = '', dia = '' } = body;

        if (!data) {
          return sendJson(res, 400, { erro: 'data e obrigatoria' }, req);
        }

        const result = await pool.query(
          'INSERT INTO datas_festival (data, evento, local, dia) VALUES ($1, $2, $3, $4) RETURNING id, data, evento, local, dia',
          [String(data), String(evento).trim(), String(local).trim(), String(dia).trim()]
        );

        return sendJson(res, 201, result.rows[0], req);
      }

      const id = Number(idOrAction);
      if (!Number.isInteger(id)) {
        return sendJson(res, 400, { erro: 'id invalido' }, req);
      }

      if (req.method === 'PUT') {
        const body = await parseJsonBody(req);
        const { data, evento, local, dia } = body;
        const atual = await pool.query('SELECT id, data, evento, local, dia FROM datas_festival WHERE id = $1', [id]);

        if (atual.rowCount === 0) {
          return sendJson(res, 404, { erro: 'data nao encontrada' }, req);
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

        return sendJson(res, 200, result.rows[0], req);
      }

      if (req.method === 'DELETE') {
        const result = await pool.query('DELETE FROM datas_festival WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
          return sendJson(res, 404, { erro: 'data nao encontrada' }, req);
        }

        return sendEmpty(res, 204, req);
      }
    }

    return sendJson(res, 404, { erro: 'rota nao encontrada' }, req);
  } catch (error) {
    if (error?.statusCode === 400) {
      return sendJson(res, 400, { erro: 'json invalido' }, req);
    }

    console.error('Erro na API:', error);
    return sendJson(res, 500, { erro: 'falha na api' }, req);
  }
}