#!/bin/bash

# LexiFlow AI - Dependency Installation Script
# This script installs all required dependencies for the PDF extraction feature

echo "🚀 LexiFlow AI - Installing Dependencies"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH"
    echo "   Please install MongoDB:"
    echo "   - macOS: brew install mongodb-community"
    echo "   - Ubuntu: sudo apt-get install mongodb"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB detected"
fi

# Check if Tesseract is installed
if ! command -v tesseract &> /dev/null; then
    echo "⚠️  Tesseract OCR is not installed or not in PATH"
    echo "   Please install Tesseract:"
    echo "   - macOS: brew install tesseract"
    echo "   - Ubuntu: sudo apt-get install tesseract-ocr"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Tesseract $(tesseract --version | head -n1) detected"
fi

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing Python packages..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All dependencies installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Make sure MongoDB is running: brew services start mongodb-community"
    echo "2. Activate the virtual environment: source venv/bin/activate"
    echo "3. Run the backend: python main.py"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi

