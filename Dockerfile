FROM node:18-alpine3.14 as builder
RUN mkdir -p /home/node/schedule-services/node_modules

WORKDIR /home/node/schedule-services

COPY package.json package-lock.json ./

COPY tsconfig.json ./

RUN npm install

COPY . .

EXPOSE 5001
CMD ["npm", "run", "dev"]
