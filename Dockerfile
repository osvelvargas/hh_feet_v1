FROM node:14.15.4

WORKDIR /usr/src/app

COPY . .

ENV MONGO_URI=mongodb://mongo:27017
ENV PORT=80

EXPOSE 80

CMD [ "npm", "start" ]
