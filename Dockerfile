FROM node:18

# ARM
RUN apt-get update && \
    apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev 

WORKDIR /workspace/discord-bot

COPY ./bot/package*.json ./

RUN npm ci

# ARM
RUN npm rebuild @tensorflow/tfjs-node --build-from-source