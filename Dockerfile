FROM node:18

WORKDIR /workspace/discord-bot

COPY ./bot/package*.json ./

RUN npm ci
