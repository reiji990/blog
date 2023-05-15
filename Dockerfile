FROM node

WORKDIR /home/app

COPY package*.json ./

RUN yarn install

COPY . .

CMD ["yarn", "dev"]
