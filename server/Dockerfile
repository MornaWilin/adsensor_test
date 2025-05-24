FROM node:lts
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./
RUN npm i

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]