# Personal Terminal Portfolio

Um portfólio pessoal e interativo no estilo "Terminal", desenvolvido para exibir experiências, habilidades, e interesses através de uma interface moderna de chat usando IA. O usuário pode conversar com uma Inteligência Artificial treinada com o seu perfil, ler sobre seus projetos e explorar um painel de administração completo.

## 🚀 Tecnologias

Este projeto é um monorepo dividido em duas partes principais:

### Frontend (`/web`)
- **Framework**: Next.js 14+ (App Router)
- **Estilização**: Tailwind CSS v4 (com Glassmorphism e Glow effects)
- **Linguagem**: TypeScript
- **Componentes**: React Icons, React Markdown
- **Analytics**: PostHog

### Backend (`/api`)
- **Framework**: FastAPI (Python)
- **IA**: Google Vertex AI (Gemini 2.5 Flash Lite)
- **Gestão de Pacotes**: `uv`
- **Autenticação**: Google OAuth 2.0 via `itsdangerous` e JWT
- **Interface Admin**: Single Page Application (SPA) nativa (HTML/JS) servida pelo FastAPI

---

## 🛠️ Como Executar o Projeto Localmente

Você tem duas opções para subir a aplicação: via **Docker Compose** ou **Manualmente**.

### Pré-requisitos
Antes de executar, você precisa configurar as variáveis de ambiente.

1. Dentro da pasta `/api`, crie um arquivo `.env` baseado nas variáveis necessárias:
```env
GCP_PROJECT_ID=gen-lang-client-...
GCP_LOCATION=us-central1
GOOGLE_CLIENT_ID=SEU_GOOGLE_CLIENT_ID
ADMIN_EMAIL=seu_email@gmail.com
SECRET_KEY=sua-chave-secreta-segura
```

2. Dentro da pasta `/web`, crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_POSTHOG_KEY=sua-chave-posthog
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

3. Configure o *Application Default Credentials* (ADC) do Google Cloud no terminal caso for rodar localmente sem credenciais hardcoded:
```bash
gcloud auth application-default login
```

### Opção 1: Via Docker Compose (Recomendado)
Para subir o ambiente completo com uma imagem standalone do Next.js e o FastAPI rodando com `uv`:

```bash
docker compose up --build -d
```
O Frontend estará acessível em `http://localhost:3000` e o Backend/Admin em `http://localhost:8000`.

### Opção 2: Manualmente
Se desejar rodar em ambiente de desenvolvimento com hot-reload ativo.

**Terminal 1 (Backend)**:
```bash
cd api
uv run uvicorn main:app --reload
```

**Terminal 2 (Frontend)**:
```bash
cd web
npm install
npm run dev
```

---

## ⚙️ Painel Administrativo

O projeto conta com um painel de administração para edição dinâmica dos dados sem necessidade de modificar código.
Acesse `http://localhost:8000/admin` e faça login com a conta Google cadastrada no `ADMIN_EMAIL`. 

O que é possível editar no admin:
- Informações principais (Bio, Título, Status)
- Links Sociais
- Prompt base de comportamento da IA
- Linha do Tempo e fases do Mestrado
- Upload e exclusão de imagens da galeria local
- Tópicos do Universo Pessoal (Hobbies, leituras, setup) com edição via JSON.

Todas as alterações feitas no admin são refletidas imediatamente no frontend e salvas no arquivo `/profile.json` na raiz do projeto.

---

## 📝 Licença

Este projeto é de uso pessoal. Adapte e utilize como inspiração para criar o seu próprio terminal interativo!
