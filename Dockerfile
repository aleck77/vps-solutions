# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure environment variables for client-side Firebase are available at build time if needed by your build process
# For Next.js, public env vars (NEXT_PUBLIC_*) are usually inlined at build time.
# ARG NEXT_PUBLIC_FIREBASE_API_KEY
# ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
# ... (repeat for all NEXT_PUBLIC_ variables if your build needs them explicitly)

RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Set PORT for Next.js server, Traefik will connect to this.
ENV PORT 3000

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Copy the service account key if it's bundled with the image (alternative to volume mount)
# For security, it's often better to mount it as a volume or use Docker secrets.
# If you copy it, ensure Dockerfile and the key are not in public repos.
# COPY service-account-key.json ./service-account-key.json

# Ensure the Firebase Admin SDK can find the credentials
# This will be set in docker-compose.yml to point to the mounted volume
# ENV GOOGLE_APPLICATION_CREDENTIALS /app/service-account-key.json

USER node

EXPOSE 3000

CMD ["node", "server.js"]
