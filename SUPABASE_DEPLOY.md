# Deploy no Supabase (Banco) + Vercel (Sites)

Este projeto usa PostgreSQL com Node/pg. O Supabase entra como banco gerenciado, sem precisar reescrever a API.

## 0) Alerta sobre tabela Parcerias (P maiusculo)

Se a tabela foi criada como "Parcerias", as queries em minusculo (parcerias) vao falhar com relation does not exist.

No SQL Editor do Supabase, rode:

ALTER TABLE public."Parcerias" RENAME TO parcerias;

## 1) Criar projeto no Supabase

1. Crie um novo projeto no Supabase.
2. Copie a senha do banco definida na criacao do projeto.
3. Em Project Settings > Database, copie os dados de conexao.

Formato esperado para DATABASE_URL:

postgresql://postgres:SUA_SENHA@db.SEUPROJECTREF.supabase.co:5432/postgres

## 2) Criar as tabelas no Supabase

1. Abra SQL Editor no painel do Supabase.
2. Execute o conteudo de backend/sql/init.sql.
3. Verifique se as tabelas foram criadas:
   - apresentacoes
   - parcerias
   - datas_festival
   - public_site_snapshot

## 3) Publicar o painel admin (API + app)

No projeto atual, a API usada em producao esta em admin-panel/api.

1. Importe o repositorio no Vercel.
2. Configure Root Directory como admin-panel.
3. Adicione variaveis de ambiente no Vercel:
   - DATABASE_URL = URL do Supabase
   - PG_SSL = true
   - CORS_ORIGIN = dominios permitidos, separados por virgula
   - INIT_DB = false
4. Faça deploy.
5. Teste: https://SEU_ADMIN_DOMINIO/api

Uso recomendado do INIT_DB:
- Local: INIT_DB=true para criar/ajustar tabelas automaticamente.
- Producao: INIT_DB=false para manter schema controlado no Supabase.

## 4) Publicar o site publico

1. Crie outro projeto no Vercel com Root Directory = frontend.
2. Configure a variavel:
   - VITE_API_URL = dominio do admin (sem /api)
   - Exemplo: https://admin-seu-projeto.vercel.app
3. Faça deploy.

Observacao importante:
- Nao use localhost como fallback em producao.
- Em producao, VITE_API_URL deve sempre apontar para o backend publicado.

## 5) Publicar o site pelo admin

1. Acesse o painel admin.
2. Clique em publicar para atualizar o snapshot publico.
3. Abra o frontend e confirme os dados.

## 6) Checklist rapido

- API responde em /api.
- Frontend recebe dados de /api/publico sem erro de CORS.
- PG_SSL=true no admin.
- CORS_ORIGIN contem os dominios reais de frontend e admin.
- INIT_DB=false em producao.

## 7) Se precisar migrar dados antigos

Se voce tinha um banco anterior, exporte com pg_dump e importe no Supabase (SQL Editor ou psql). Em seguida, valide no admin se os registros carregaram corretamente.
