FROM node:20-alpine

WORKDIR /app

RUN apk --no-cache add curl
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]
