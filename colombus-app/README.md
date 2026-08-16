# 🕊️ Colombus 2025

Gerencie seu calendário de competições de pombos-correio e monitore gastos logísticos de forma inteligente.

## Funcionalidades

- **Dashboard** — Estatísticas gerais, provas recentes, resumo de custos
- **Provas** — CRUD de competições (cidade, km, categoria, datas, valor, status)
- **Venda de Anilhas** — Controle de vendas com faixa de números (ex: 0000001/26 ao 0000050/26)
- **Custos** — Gastos logísticos gerais, Ribeirão Preto e Franca com exportação PDF
- **Contas Correntes** — Receíveis (Ribeirão Preto, Franca) e Sócios com parcelas (Limeira)

## 🚀 Setup Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar localmente
```bash
npm run dev
```
O app roda em `http://localhost:5173` e usa **localStorage** por padrão (sem necessidade de configuração).

---

## 🗄️ Configurar Supabase (banco de dados real)

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project** e dê um nome (ex: "colombus-2025")
3. Aguarde o projeto ser criado (~2 min)

### 2. Criar as tabelas
1. Vá em **SQL Editor** → **New Query**
2. Copie o SQL do arquivo `SUPABASE_SQL.md` (ou do código em `src/lib/supabase.js`)
3. Clique em **Run** — todas as tabelas serão criadas

### 3. Pegar as credenciais
1. Vá em **Settings** → **API**
2. Copie a **Project URL** e a **anon public key**
3. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Habilitar autenticação por email
1. Vá em **Authentication** → **Providers**
2. Certifique-se que **Email** está habilitado
3. (Opcional) Habilite **Google** para login com Google

Pronto! Ao reiniciar o dev server, o app usará o Supabase automaticamente.

---

## 🌐 Deploy na Vercel

### 1. Subir para o GitHub
```bash
git init
git add .
git commit -m "Colombus 2025"
git remote add origin https://github.com/seu-usuario/colombus-2025.git
git push -u origin main
```

### 2. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com) e conecte com GitHub
2. Clique em **New Project** → selecione o repositório
3. Adicione as **Environment Variables**:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua key do Supabase
4. Clique em **Deploy**

Pronto! Seu app estará online em `https://colombus-2025.vercel.app`

---

## 📱 Acessar como App no celular
Adicione à tela inicial do navegador — funciona como PWA!

## Estrutura do Projeto

```
src/
├── pages/          # Páginas do app
│   ├── Dashboard.jsx
│   ├── Provas.jsx
│   ├── VendaAnilhas.jsx
│   ├── CustosBase.jsx
│   ├── Custos.jsx / CustosRibeirao.jsx / CustosFranca.jsx
│   ├── CCBase.jsx
│   ├── CCRibeirao.jsx / CCFranca.jsx / CCLimeira.jsx
├── components/
│   └── ui.jsx      # Componentes reutilizáveis
├── lib/
│   ├── db.js       # Banco localStorage (fallback)
│   ├── supabase.js # Configuração Supabase + SQL
│   └── service.js  # Service layer (Supabase ou localStorage)
└── App.jsx         # Layout principal + rotas
```
