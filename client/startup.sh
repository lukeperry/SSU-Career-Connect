#!/bin/sh

# Navigate to the directory where the build is located
cd /home/site/wwwroot

# Set the PORT if it's not already set (Azure usually sets it to 8080)
export PORT=${PORT:-8080}

# Run the frontend build if necessary (optional, depending on your deployment flow)
# yarn build

# Serve the static site using the 'serve' package
serve -s build -l $PORT
