# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
