#!/bin/bash

# Adil GFX Website Setup Script
# This script sets up the development environment

echo "🚀 Setting up Adil GFX Website..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# 1. Install frontend dependencies
echo "📦 Installing frontend dependencies..."
if command -v npm &> /dev/null; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "❌ npm not found. Please install Node.js and npm first"
    exit 1
fi

# 2. Install backend dependencies
echo "📦 Installing backend dependencies..."
if command -v composer &> /dev/null; then
    cd backend && composer install && cd ..
    echo "✅ Backend dependencies installed"
else
    echo "⚠️ Composer not found. Please install PHP Composer first"
    echo "💡 You can install it from: https://getcomposer.org/download/"
fi

# 3. Set up environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Environment file created from template"
    echo "⚠️ Please edit .env file with your actual configuration values"
else
    echo "✅ Environment file already exists"
fi

# 4. Create database directory
echo "🗄️ Setting up database..."
mkdir -p backend/database
echo "✅ Database directory created"

# 5. Set up database
echo "🔧 Initializing database..."
if command -v php &> /dev/null; then
    cd backend
    php install.php
    echo "✅ Database initialized"
    cd ..
else
    echo "⚠️ PHP not found. Please install PHP first"
    echo "💡 You can install it from: https://www.php.net/downloads.php"
fi

# 6. Build frontend
echo "🏗️ Building frontend..."
npm run build
echo "✅ Frontend built successfully"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the backend server: npm run backend:start"
echo "3. Start the frontend server: npm run dev"
echo "4. Visit http://localhost:8080 to see your website"
echo ""
echo "🔧 Useful commands:"
echo "- npm run dev          # Start frontend development server"
echo "- npm run build        # Build for production"
echo "- npm run backend:start # Start PHP backend server"
echo "- npm run backend:test  # Test backend API endpoints"
echo ""
echo "📚 Documentation:"
echo "- README.md            # Main documentation"
echo "- QUICK_REFERENCE.md   # Quick setup guide"
echo "- ROCKET_SITE_COMPLETE.md # Complete feature list"
echo ""
echo "🚀 Your website is ready to launch!"
