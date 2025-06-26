
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Remove package-lock.json if it exists and install fresh
RUN rm -f package-lock.json && npm cache clean --force && npm install --production

# Copy app source
COPY . .

# Create a non-root user (OpenShift requirement)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port 8080 (OpenShift default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD [ "npm", "start" ]
