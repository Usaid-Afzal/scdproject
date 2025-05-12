FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose Vite’s default dev port
EXPOSE 5173

# Ensure Vite listens on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
