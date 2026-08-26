# Personal Terminal Portfolio

Um portfólio pessoal e interativo no estilo "Terminal", desenvolvido para exibir experiências, habilidades e interesses através de uma interface moderna de chat usando Inteligência Artificial. O usuário pode conversar com um assistente IA treinado com o perfil do autor, navegar por arquivos virtuais e um painel de administração completo.

## 🚀 Tecnologias e Arquitetura

Este projeto é um monorepo com arquitetura moderna e escalável, dividido em:

### Frontend (`/web`)
- **Framework**: Next.js 14+ (App Router) em Server Components
- **Estilização**: Tailwind CSS v4 (Glassmorphism, Filtro CRT retrô)
- **Interação**: Server-Sent Events (SSE) para efeito de digitação em tempo real (Streaming)
- **Áudio**: Efeitos sonoros gerados dinamicamente nativos via Web Audio API
- **Analytics**: PostHog (Autocapture)

### Backend (`/api`)
- **Framework**: FastAPI (Python)
- **Inteligência Artificial**: Google Vertex AI (Gemini 2.5 Flash Lite) com **Cache Semântico (SQLite)** para mitigar chamadas repetitivas e zerar latência.
- **Banco de Dados**: SQLite (`portfolio.db`) - Armazenamento atômico e robusto de todos os dados dinâmicos do projeto.
- **Storage**: Upload inteligente para S3 Bucket (Magalu Cloud) via `boto3` para PDFs e currículos, com fallback local.
- **Autenticação**: Google OAuth 2.0 via `itsdangerous` e JWT
- **Interface Admin**: Single Page Application nativa em Tailwind CSS com **Live Preview** (Split Screen).

---

## 🛠️ Como Executar o Projeto Localmente

Você tem duas opções para subir a aplicação: via **Docker Compose** ou **Manualmente**.

### Pré-requisitos
Configure os arquivos de variáveis de ambiente:

1. Na pasta `/api`, crie o arquivo `.env`:
```env
# GCP & IA
GCP_PROJECT_ID=gen-lang-client-...
GCP_LOCATION=us-central1
GOOGLE_CLIENT_ID=SEU_GOOGLE_CLIENT_ID
ADMIN_EMAIL=seu_email@gmail.com
SECRET_KEY=sua-chave-secreta-segura
FRONTEND_URL=http://localhost:3000 # Para o painel de admin acessar o Live Preview local


# S3 Storage / Magalu Cloud (Opcional - para Upload do CV)
MGC_BUCKET_NAME=seu-bucket
MGC_ACCESS_KEY=sua-access-key
MGC_SECRET_KEY=sua-secret-key
MGC_ENDPOINT_URL=https://br-se1.magaluobjects.com
```

2. Na pasta `/web`, crie o arquivo `.env.local`:
```env
NEXT_PUBLIC_POSTHOG_KEY=sua-chave-posthog
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_CV_URL=https://seu-bucket.mgc.com/cv.pdf
API_URL=http://localhost:8000 # ou http://api:8000 no Docker
```

3. Configure o *Application Default Credentials* (ADC) do Google Cloud no terminal caso for rodar localmente sem credenciais em nuvem:
```bash
gcloud auth application-default login
```

### Opção 1: Via Docker Compose (Recomendado)
Para subir o ambiente com as imagens otimizadas para produção (standalone):
```bash
docker compose up --build -d
```
Frontend em `http://localhost:3000` e Backend em `http://localhost:8000`.

### Opção 2: Manualmente (Desenvolvimento)
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

O projeto inclui um painel administrativo oculto desenvolvido em Tailwind para edição total do site sem alterar código. 
Acesse `http://localhost:8000/admin` e faça login com a conta cadastrada no `ADMIN_EMAIL`.

**Funcionalidades Especiais do Admin**:
- **Live Preview Integrado**: A tela dividida carrega o frontend em tempo real à direita.
- **Componentização Visual**: Seções complexas (como hobbies, links e livros lidos) são controladas via formulários visuais.
- **Mídia e S3**: Envie imagens da galeria e faça upload/deploy do seu Currículo diretamente para a nuvem.

Todas as alterações feitas no admin são salvas instantaneamente no banco `portfolio.db` no backend.

---

## 📝 Licença
Este projeto é de uso pessoal. Sinta-se livre para usar as ideias e a arquitetura para criar o seu próprio sistema interativo!
