FROM node:10

ADD package.json .
ADD yarn.lock .

RUN yarn install

ADD index.js .

EXPOSE 3000

ENTRYPOINT [ "node", "index.js" ]
