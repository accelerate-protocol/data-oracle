FROM node:24
WORKDIR /app
COPY . .
RUN npm ci
RUN npx hardhat compile

