FROM node:15-alpine as base

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
ARG PORT=8080 
ENV PORT $PORT

WORKDIR /opt/node_app

FROM base as deps
RUN apk --no-cache --update --virtual build-dependencies add \
    python \
    make \
    g++ 

COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./npm-shrinkwrap.json ./
RUN npm ci --also=dev \
    && npm cache clean --force

COPY --chown=node:node ./ ./
RUN npm run build 

FROM base as release
RUN apk add --no-cache tini
USER node
WORKDIR /opt/node_app/
COPY  --chown=node:node --from=deps /opt/node_app/__sapper__/build ./__sapper__/build
COPY  --chown=node:node --from=deps /opt/node_app/node_modules ./node_modules
COPY --chown=node:node --from=deps /opt/node_app/static ./static


CMD [ "/sbin/tini", "node", "./__sapper__/build" ]

