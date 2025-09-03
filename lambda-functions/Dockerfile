FROM public.ecr.aws/lambda/nodejs:22.2025.09.02.20

# Put code under Lambda task root
WORKDIR /var/task

# Install deps
COPY package*.json ./
RUN npm install

# Copy source and generate Prisma client
COPY . .
RUN npx prisma generate

# Build TS -> dist
RUN npm run build

# Optional: keep source out of the image at runtime
RUN rm -rf src

# Your handler is exported in dist/index.js as [handler](cci:1://file:///home/jashan/Dev/open-source/timelypost/lambda-functions/src/index.ts:11:0-67:1)
CMD ["dist/index.handler"]