FROM node:18-slim

WORKDIR /usr/src/app

COPY . .
RUN npm install

CMD [ "node", "index.js" ]