FROM node:20-alpine AS builder

WORKDIR /app
COPY web/package*.json ./
RUN npm ci

COPY web ./
# Copiar o profile.json para a raiz (esperado pelo page.tsx na build)
COPY profile.json /profile.json

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Garantir que o json esteja disponível no runtime caso o container suba sem os volumes
COPY --from=builder /profile.json /profile.json

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
