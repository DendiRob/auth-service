FROM node:22-alpine3.21

WORKDIR /backend

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm run dbpush && npm run start:prod"]
