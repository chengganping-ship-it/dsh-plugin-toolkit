FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production=false && npm run build && npm install --production
COPY dist ./dist
COPY sentinel.example.json ./sentinel.example.json
CMD ["node", "dist/sentinel.js"]
