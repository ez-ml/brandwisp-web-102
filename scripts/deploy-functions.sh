#!/bin/bash

# Deploy Cloud Functions for BrandWisp Real Store Integration
echo "🚀 Deploying BrandWisp Cloud Functions..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Set environment variables
echo "🔧 Setting environment variables..."
firebase functions:config:set \
  bigquery.project_id="brandwisp-dev" \
  bigquery.dataset_id="analytics" \
  shopify.webhook_secret="your_webhook_secret_here"

# Navigate to functions directory
cd functions

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Deploy functions
echo "🚀 Deploying functions..."
cd ..
firebase deploy --only functions

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables with your actual values:"
echo "   firebase functions:config:set shopify.webhook_secret=\"your_actual_secret\""
echo "2. Test the functions:"
echo "   firebase functions:log"
echo "3. Set up Shopify webhooks to point to your function URLs" 