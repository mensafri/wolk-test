FROM node:20-alpine
WORKDIR /app

# Install OpenSSL for Prisma compatibility in Alpine
RUN apk add --no-cache openssl


# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Start script that also runs migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/index.js"]
