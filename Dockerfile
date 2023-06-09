FROM node:18

RUN apt-get update && \
    apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev 

WORKDIR /workspace/discord-bot

COPY ./bot/package*.json ./

RUN npm ci && npm i -g typeorm
