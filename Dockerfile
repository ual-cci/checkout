# Build from node v10 alpine with gyp + git for npm
FROM node:10-alpine
RUN apk add --no-cache g++ make python

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Work at non-root user to setup environment
USER node
ENV NODE_ENV=production

# Install modules
COPY package*.json ./
RUN npm ci

# Copy application
COPY --chown=node:node . .

# Run app and open port
EXPOSE 3000
CMD ["node", "app.js"]
