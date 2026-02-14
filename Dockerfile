FROM node

WORKDIR /home/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN node .yarn/releases/yarn-3.6.1.cjs install

CMD ["node", ".yarn/releases/yarn-3.6.1.cjs", "dev"]
