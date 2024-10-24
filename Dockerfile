# Use official Node.js image
FROM node:lts-alpine
ENV NODE_ENV=production

WORKDIR /src

# Copy package files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --prod=false; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile --prod=false; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy all the code
COPY . .


# Run Prisma generate to initialize the client
RUN npx prisma generate


# Build
RUN pnpm build

# Remove dev dependencies after build to optimize image size
RUN pnpm prune --prod

EXPOSE 3001

CMD ["node", "dist/src/main"]
