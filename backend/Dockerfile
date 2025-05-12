# Stage 1: dependencies + build
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose the port your server listens on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
