FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./

# Clean install without using existing lock file
RUN npm cache clean --force && \
    npm install --production && \
    npm cache clean --force

# Copy app source
COPY . .

# Create a non-root user (OpenShift requirement)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app

USER nodejs

# Expose port 8080 (OpenShift default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD [ "npm", "start" ]
