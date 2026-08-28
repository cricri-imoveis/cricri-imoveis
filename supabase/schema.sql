-- =====================================================================
--  CRICRI IMOVEIS — esquema do banco de dados (Supabase / PostgreSQL)
--  Cole este arquivo inteiro no Supabase: menu "SQL Editor" > New query
--  > cole tudo > RUN. Pode rodar mais de uma vez sem problema.
-- =====================================================================

-- --------- TABELA: imoveis (identificados pelo endereco completo) -----
create table if not exists public.imoveis (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  rua           text not null,
  numero        text not null,
  complemento   text,
  bairro        text,
  cidade        text not null,
  estado        text,
  cep           text,
  tipo          text,              -- 'apartamento' | 'casa'
  nome_condominio text,
  chave_busca   text not null unique   -- endereco normalizado (agrupa avaliacoes do mesmo imovel)
);
create index if not exists imoveis_cidade_idx on public.imoveis (cidade);

-- --------- TABELA: avaliacoes (CONTEUDO PAGO) -------------------------
create table if not exists public.avaliacoes (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  imovel_id     uuid not null references public.imoveis(id) on delete cascade,
  autor_id      uuid not null references auth.users(id) on delete cascade,
  tipo_morador  text,              -- 'proprietario' | 'locatario'
  nota_conservacao int check (nota_conservacao between 1 and 5),
  nota_vizinhanca  int check (nota_vizinhanca  between 1 and 5),
  nota_relacao     int check (nota_relacao     between 1 and 5),
  nota_seguranca   int check (nota_seguranca   between 1 and 5),
  nota_custo       int check (nota_custo       between 1 and 5),
  comentario    text
);
create index if not exists avaliacoes_imovel_idx on public.avaliacoes (imovel_id);

-- --------- TABELA: acessos (imoveis que cada usuario LIBEROU) ---------
create table if not exists public.acessos (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  imovel_id     uuid not null references public.imoveis(id) on delete cascade,
  pagamento_ref text,              -- id do pagamento (Mercado Pago), quando existir
  unique (user_id, imovel_id)
);

-- =====================================================================
--  SEGURANCA (Row Level Security) — quem pode ver e gravar cada coisa
-- =====================================================================
alter table public.imoveis   enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.acessos   enable row level security;

-- imoveis: qualquer visitante pode consultar; usuario logado pode cadastrar
drop policy if exists imoveis_select on public.imoveis;
create policy imoveis_select on public.imoveis for select using (true);
drop policy if exists imoveis_insert on public.imoveis;
create policy imoveis_insert on public.imoveis for insert to authenticated with check (true);

-- avaliacoes: o autor ve as suas; quem PAGOU (tem acesso) ve as do imovel liberado
drop policy if exists avaliacoes_select on public.avaliacoes;
create policy avaliacoes_select on public.avaliacoes for select using (
  autor_id = auth.uid()
  or exists (
    select 1 from public.acessos a
    where a.imovel_id = avaliacoes.imovel_id and a.user_id = auth.uid()
  )
);
drop policy if exists avaliacoes_insert on public.avaliacoes;
create policy avaliacoes_insert on public.avaliacoes for insert to authenticated with check (autor_id = auth.uid());

-- acessos: cada usuario ve e cria os seus
drop policy if exists acessos_select on public.acessos;
create policy acessos_select on public.acessos for select using (user_id = auth.uid());
-- ATENCAO (temporario): enquanto o pagamento real do Mercado Pago nao esta ligado,
-- esta regra deixa o proprio usuario criar o acesso (liberacao SIMULADA / gratuita).
-- Quando ligarmos o pagamento, este INSERT sai daqui e passa a ser feito pelo
-- servidor (service role) SO depois do pagamento confirmado.
drop policy if exists acessos_insert on public.acessos;
create policy acessos_insert on public.acessos for insert to authenticated with check (user_id = auth.uid());

-- =====================================================================
--  RESUMO PUBLICO por imovel: media e quantidade de avaliacoes,
--  SEM expor o conteudo individual (isso continua pago).
-- =====================================================================
create or replace view public.imoveis_resumo
with (security_invoker = false) as
select
  i.id, i.rua, i.numero, i.complemento, i.bairro, i.cidade, i.estado,
  i.tipo, i.nome_condominio, i.chave_busca,
  count(a.id) as qtd_avaliacoes,
  round(avg((a.nota_conservacao + a.nota_vizinhanca + a.nota_relacao
             + a.nota_seguranca + a.nota_custo) / 5.0), 1) as nota_media
from public.imoveis i
left join public.avaliacoes a on a.imovel_id = i.id
group by i.id;

grant select on public.imoveis_resumo to anon, authenticated;
