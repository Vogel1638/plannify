# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Expose port 3000
EXPOSE 3000

CMD ["npm", "start"]
