FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=8086
EXPOSE 8086

CMD ["npm", "run", "api:cloud"]
