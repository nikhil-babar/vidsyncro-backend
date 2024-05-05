FROM node:alpine

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

CMD [ "node", "src/services/transcription/index.js" ]