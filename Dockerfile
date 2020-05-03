# Build stage
FROM node:13-alpine AS build
WORKDIR /usr/app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

# App stage
FROM node:13-alpine as app
WORKDIR /usr/app
COPY package*.json ./
ENV NODE_ENV=production
RUN yarn install --production

COPY --from=build /usr/app/dist ./dist
VOLUME /usr/app/img

EXPOSE 42069
CMD node dist/index.js
