#
# Checkout Docker File
# ====================FROM node:10

WORKDIR /app
COPY package.json /app
RUN npm install --production
COPY . /app

ENV NODE_ENV=production
ENV APP_HOST=
ENV APP_PORT=8080
ENV APP_NAME=Checkout
ENV USER_PW_ITERATIONS=50000
ENV USER_PW_TRIES=5
ENV LOG_PATH=./logs/checkout.log
ENV LOG_STDOUT=false

CMD node index.js

EXPOSE 8080
