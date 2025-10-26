#!/bin/bash

# LexiFlow AI Backend Run Script
# Quick script to run the development server

echo "🚀 Starting LexiFlow AI Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Run the server
python main.py

