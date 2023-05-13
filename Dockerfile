FROM node

WORKDIR /home/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]

RUN yarn global add firebase-tools
