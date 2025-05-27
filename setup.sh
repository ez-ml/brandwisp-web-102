#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up BrandWisp Web Platform...${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please update it with your API keys.${NC}"
fi

# Build the application
echo -e "${BLUE}Building the application...${NC}"
npm run build

# Run tests
echo -e "${BLUE}Running tests...${NC}"
npm test

echo -e "\n${GREEN}Setup completed!${NC}"
echo -e "To start the development server, run: ${BLUE}npm run dev${NC}"
echo -e "To start the production server, run: ${BLUE}npm start${NC}"
echo -e "\nMake sure to:"
echo -e "1. Update your .env file with the necessary API keys"
echo -e "2. Configure your database settings if needed"
echo -e "3. Set up authentication if required" 