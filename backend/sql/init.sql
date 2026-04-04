CREATE TABLE IF NOT EXISTS apresentacoes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  classificacao TEXT DEFAULT '',
  duracao TEXT DEFAULT '',
  genero TEXT DEFAULT '',
  data TEXT DEFAULT '',
  status TEXT DEFAULT 'ativo',
  local TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  sinopse TEXT DEFAULT '',
  elenco TEXT DEFAULT '',
  avisos TEXT DEFAULT '',
  data_inicio TEXT DEFAULT '',
  data_fim TEXT DEFAULT '',
  imagem_card TEXT,
  imagem_carousel TEXT,
  imagem_carousel_posicao TEXT DEFAULT '50% 50%',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parcerias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_site_snapshot (
  id INTEGER PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  published_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT public_site_snapshot_single_row CHECK (id = 1)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_apresentacoes_updated_at ON apresentacoes;
CREATE TRIGGER set_apresentacoes_updated_at
BEFORE UPDATE ON apresentacoes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_parcerias_updated_at ON parcerias;
CREATE TRIGGER set_parcerias_updated_at
BEFORE UPDATE ON parcerias
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_public_site_snapshot_updated_at ON public_site_snapshot;
CREATE TRIGGER set_public_site_snapshot_updated_at
BEFORE UPDATE ON public_site_snapshot
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

