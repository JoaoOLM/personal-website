# Use a imagem oficial leve do Python
FROM python:3.12-slim

# Diretório de trabalho na imagem
WORKDIR /app

# Instalar uv para gerenciar pacotes mais rápido
RUN pip install --no-cache-dir uv

# Copiar arquivos de configuração de dependências primeiro
COPY api/pyproject.toml api/uv.lock ./api/
RUN cd api && uv sync --no-install-project

# Copiar o restante da API e o arquivo de contexto
COPY api ./api
COPY profile.json .

# Expor a porta que o Cloud Run usa
ENV PORT=8000
EXPOSE $PORT

# Comando para iniciar o servidor
WORKDIR /app/api
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
