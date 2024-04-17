FROM node:alpine

WORKDIR /app

RUN apk update
RUN apk add
RUN apk add ffmpeg

COPY package.json package.json

RUN npm install

COPY . .

CMD [ "node", "src/services/transcoding/index.js" ]