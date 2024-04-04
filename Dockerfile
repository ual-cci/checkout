# Build from node v20 alpine with gyp + pm2
FROM node:20-alpine
RUN apk add --no-cache g++ make python3
RUN yarn global add pm2

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
CMD ["pm2-runtime", "ecosystem.config.js"]
