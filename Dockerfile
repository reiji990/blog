FROM node

WORKDIR /home/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN node .yarn/releases/yarn-3.6.1.cjs install --immutable

CMD ["sh", "-c", "node .yarn/releases/yarn-3.6.1.cjs contentlayer2 build && node .yarn/releases/yarn-3.6.1.cjs dev"]
