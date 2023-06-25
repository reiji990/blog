# Dockerfile
FROM node

RUN yarn global add firebase-tools

RUN yarn add date-fns --save