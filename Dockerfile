FROM node:20-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build && npm prune --omit=dev
RUN mkdir -p /app/uploads

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
