FROM node:18-slim

WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apt-get update -y && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create a deployment script
COPY deploy.sh .
RUN chmod +x deploy.sh

# Expose the port
EXPOSE 3000

# Start the server
CMD ["./deploy.sh"] 