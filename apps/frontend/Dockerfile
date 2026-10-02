FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install @rollup/rollup-linux-x64-musl
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
