# Dockerfile
FROM node:19

RUN yarn global add firebase-tools

RUN yarn add date-fns --save