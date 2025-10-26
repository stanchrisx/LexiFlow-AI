#!/bin/bash

# LexiFlow AI Backend Setup Script
# This script sets up the backend environment

echo "🚀 Setting up LexiFlow AI Backend..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "⚠️  WARNING: Please update the SECRET_KEY in .env file before running in production!"
fi

# Initialize database
echo "🗄️  Initializing database..."
python database.py

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the server:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run the server: python main.py"
echo "  3. Visit: http://localhost:8000/docs"
echo ""
echo "⚠️  IMPORTANT: Change the SECRET_KEY in .env before deploying to production!"

