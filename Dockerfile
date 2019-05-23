FROM node:alpine AS CDN

WORKDIR /app
COPY . /app 
RUN npm install



