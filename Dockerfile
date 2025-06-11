# Use the official Node.js image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies with legacy-peer-deps to bypass dependency conflicts
RUN npm install --legacy-peer-deps --production

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install a lightweight HTTP server to serve the React app
RUN npm install -g serve

# Expose the port Cloud Run expects the app to listen on
EXPOSE 8080

# Define the command to serve the app
CMD ["serve", "-s", "build", "-l", "8080"]
