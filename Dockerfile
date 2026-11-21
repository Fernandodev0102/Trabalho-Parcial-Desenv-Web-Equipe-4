FROM node:22-alpine

RUN apk add --no-cache tini

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY backend ./backend
COPY css ./css
COPY js ./js
COPY tela_inicial.html tela_cadastro.html lista-produtos-fornecedores.html ./

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/fornecedores" > /dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/servidor.js"]
