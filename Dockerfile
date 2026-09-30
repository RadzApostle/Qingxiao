FROM node:22

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick libwebp-dev curl python3 python3-pip && \
    curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    yt-dlp --version && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package.json ./

# Install npm dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Create sessions directory
RUN mkdir -p sessions sessions_jadibot

# Expose port (if needed for pairing/QR web interface)
EXPOSE 3000

# Start the bot
CMD ["node", "main.js"]
