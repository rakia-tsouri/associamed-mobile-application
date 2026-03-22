FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency files first to utilize Docker layer caching
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the NestJS application code
COPY . .

# Build the NestJS app (compiles TypeScript to JavaScript in the 'dist' folder)
RUN npm run build

# Expose backend API port
EXPOSE 3000

# Start the application in production mode
CMD [ "npm", "run", "start:prod" ]
