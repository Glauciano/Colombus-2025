# Colombus 2025

App independente de gerenciamento de pombos-correio, originalmente criado no Base44.

## Funcionalidades

- **Dashboard** - Visão geral de provas, custos e estatísticas
- **Provas** - Calendário de competições (data embarque/solta, km, categoria, status)
- **Venda de Anilhas** - Controle de vendas por sócio (NOVO!)
- **Custos** - Gastos logísticos gerais (combustível, pedágio, motorista, etc.)
- **Custos Ribeirão Preto** - Rateio de custos - Ribeirão Preto
- **Custos Franca** - Rateio de custos - Franca
- **CC Ribeirão Preto** - Conta corrente / recebíveis
- **CC Franca** - Conta corrente / recebíveis
- **CC Limeira** - Sócios e parcelas (10 parcelas por sócio)
- **Configuração** - Importar dados do Base44 + Conexão Supabase

## Stack

- **React 19** + **Vite 8** + **Tailwind CSS 4**
- **Supabase** (banco de dados em nuvem) ou **localStorage** (offline)
- **jsPDF** para exportação de PDF
- **Lucide React** para ícones

## Modo de Dados

O app funciona em dois modos:

1. **localStorage** (padrão) - Dados ficam no navegador, sem necessidade de servidor
2. **Supabase** (opcional) - Dados ficam na nuvem, acessíveis de qualquer dispositivo

Para ativar o Supabase, vá em "Importar Dados" → "Conexão Supabase" → "Ativar Supabase".

## Setup do Supabase

1. Execute o SQL em `SUPABASE_FIX_SQL.md` no SQL Editor do Supabase
2. Vá em "Importar Dados" no app
3. Clique em "Testar Conexão"
4. Clique em "Ativar Supabase"
5. Clique em "Enviar Dados para Supabase"

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy no Vercel

```bash
# Com Vercel CLI
npx vercel --prod

# Ou via GitHub: suba o repo e conecte no Vercel Dashboard
```

Variáveis de ambiente necessárias (no Vercel):
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anon do Supabase
