# Stage 1: Build React app
#FROM --platform=linux/arm64 node:lts as build-stage
FROM node:lts
WORKDIR /app

COPY package*.json ./
RUN npm install --os=linux --cpu=x64 sharp
RUN npm install

COPY . ./
RUN rm -rf .next .swc tsconfig.tsbuildinfo
RUN npm run build

EXPOSE 3000
CMD [ "npm", "run", "start" ]
