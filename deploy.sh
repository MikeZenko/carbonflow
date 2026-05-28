#!/bin/bash

# CarbonCapture Marketplace Deployment Script
# This script helps deploy the backend to Railway and frontend to Vercel

echo "CarbonCapture Marketplace Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_tools() {
    echo "Checking required tools..."

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed. Please install Node.js and npm first.${NC}"
        exit 1
    fi

    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}Python 3 is not installed. Please install Python 3 first.${NC}"
        exit 1
    fi

    echo -e "${GREEN}All required tools are installed${NC}"
}

# Test backend functionality
test_backend() {
    echo "Testing backend functionality..."
    cd backend

    # Test vector system
    python3 -c "from vector_engine import VectorEngine; from matching_engine import AdvancedMatcher; print('Vector system test passed')" || {
        echo -e "${RED}Vector system test failed${NC}"
        return 1
    }

    # Test Flask app
    python3 -c "from app import app; print('Flask app test passed')" || {
        echo -e "${RED}Flask app test failed${NC}"
        return 1
    }

    cd ..
    echo -e "${GREEN}Backend tests passed${NC}"
}

# Test frontend functionality
test_frontend() {
    echo "Testing frontend functionality..."
    cd frontend

    # Install dependencies
    npm install || {
        echo -e "${RED}npm install failed${NC}"
        return 1
    }

    # Test build
    npm run build || {
        echo -e "${RED}Frontend build failed${NC}"
        return 1
    }

    cd ..
    echo -e "${GREEN}Frontend tests passed${NC}"
}

# Deploy to Railway
deploy_backend() {
    echo "Deploying backend to Railway..."

    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW} Railway CLI not found. Installing...${NC}"
        npm install -g @railway/cli
    fi

    cd backend

    echo "Please ensure you have:"
    echo "1. Created a Railway account at https://railway.app"
    echo "2. Set up your environment variables in Railway dashboard"
    echo "3. Connected your GitHub repository to Railway"
    echo ""
    echo "Required environment variables:"
    echo "- JWT_SECRET_KEY (required)"
    echo "- AZURE_OPENAI_ENDPOINT (optional)"
    echo "- AZURE_OPENAI_API_KEY (optional)"
    echo ""
    read -p "Have you completed the Railway setup? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway login
        railway init
        railway up
    else
        echo -e "${YELLOW} Please complete Railway setup first${NC}"
        echo "See DEPLOYMENT.md for detailed instructions"
    fi

    cd ..
}

# Deploy to Vercel
deploy_frontend() {
    echo "Deploying frontend to Vercel..."

    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW} Vercel CLI not found. Installing...${NC}"
        npm install -g vercel
    fi

    cd frontend

    echo "Please ensure you have:"
    echo "1. Created a Vercel account at https://vercel.com"
    echo "2. Set up your environment variables in Vercel dashboard"
    echo "3. Updated VITE_API_BASE_URL to your Railway deployment URL"
    echo ""
    read -p "Have you completed the Vercel setup? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel --prod
    else
        echo -e "${YELLOW} Please complete Vercel setup first${NC}"
        echo "See DEPLOYMENT.md for detailed instructions"
    fi

    cd ..
}

# Main deployment function
main() {
    echo "Please choose deployment option:"
    echo "1. Test only (recommended first)"
    echo "2. Deploy backend to Railway"
    echo "3. Deploy frontend to Vercel"
    echo "4. Full deployment (backend + frontend)"
    echo "5. Exit"

    read -p "Enter your choice (1-5): " choice

    case $choice in
        1)
            check_tools
            test_backend
            test_frontend
            echo -e "${GREEN}All tests passed! Ready for deployment.${NC}"
            ;;
        2)
            check_tools
            test_backend
            deploy_backend
            ;;
        3)
            check_tools
            test_frontend
            deploy_frontend
            ;;
        4)
            check_tools
            test_backend
            test_frontend
            deploy_backend
            deploy_frontend
            echo -e "${GREEN}Full deployment completed!${NC}"
            ;;
        5)
            echo "Exiting deployment script"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please select 1-5.${NC}"
            main
            ;;
    esac
}

# Run main function
main

echo ""
echo "For detailed deployment instructions, see DEPLOYMENT.md"
echo "For troubleshooting, check the logs in Railway/Vercel dashboards"
echo "Happy deploying!"