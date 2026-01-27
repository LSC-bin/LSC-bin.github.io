#Dockerfile (Static)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . . 
RUN npm run build

#Nginx FILE serving
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html

#portnumber 3000 -> 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


