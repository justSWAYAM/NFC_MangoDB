#!/bin/bash

echo "🎤 Setting up Speech-to-Text Emotion Analysis System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Check for environment file
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Emotion Analysis Backend Environment Variables

# Google Gemini AI API Key (Required)
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=production

# Optional: Logging Level
LOG_LEVEL=info

# Optional: Data Directory (defaults to ./data)
DATA_DIR=./data
EOF
    echo "⚠️  Please update the .env file with your Google Gemini AI API key"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
else
    echo "✅ .env file already exists"
fi

# Check if API key is set
if grep -q "your-gemini-api-key-here" .env; then
    echo "⚠️  Please update GOOGLE_GEMINI_API_KEY in .env file"
else
    echo "✅ API key appears to be configured"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "To start in development mode:"
echo "  npm run dev"
echo ""
echo "To test the API:"
echo "  curl http://localhost:3001/api/health"
echo ""
echo "📚 For more information, see README.md" 