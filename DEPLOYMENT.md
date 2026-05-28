# Deployment Guide - CarbonCapture Marketplace

This guide covers deploying the CarbonCapture Marketplace to Railway (backend) and Vercel (frontend).

## Overview

- **Backend**: Flask API with vector-based matching system → Railway
- **Frontend**: React/Vite application → Vercel
- **Database**: JSON file (will persist on Railway)
- **Vector System**: File-based storage (Railway compatible)

## Railway Backend Deployment

### 1. Prepare Repository
```bash
# Navigate to backend directory
cd backend

# Ensure all files are ready
ls -la  # Should see: app.py, requirements.txt, Procfile, railway.json
```

### 2. Deploy to Railway

#### Option A: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: GitHub Integration
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder as root directory
4. Railway will automatically detect the Python app

### 3. Configure Environment Variables

In Railway dashboard, set these environment variables:

```bash
# Required
JWT_SECRET_KEY=your-super-secret-jwt-key-for-production-railway

# Optional (for AI features)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# System (automatic)
PORT=5001  # Railway sets this automatically
FLASK_DEBUG=False
```

### 4. Verify Deployment

Your backend will be available at: `https://[your-app-name].up.railway.app`

Test endpoints:
- `GET /` - Health check
- `GET /api/matches?producer_id=prod_001` - Vector matching test
- `GET /api/matching-stats` - System statistics

## Vercel Frontend Deployment

### 1. Prepare Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Go to [Vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Select the `frontend` folder as root directory
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Configure Environment Variables

In Vercel dashboard, set:

```bash
VITE_API_BASE_URL=https://your-railway-app.up.railway.app
VITE_APP_TITLE=CarbonCapture Marketplace
VITE_ENVIRONMENT=production
```

### 4. Verify Deployment

Your frontend will be available at: `https://[your-app-name].vercel.app`

## Configuration Files

### Backend Files:
- `railway.json` - Railway configuration
- `Procfile` - Process configuration
- `requirements.txt` - Python dependencies
- `env.example` - Environment variables template

### Frontend Files:
- `vercel.json` - Vercel configuration
- `vite.config.js` - Vite build configuration
- `package.json` - Node.js dependencies

## Testing Deployment

### Backend Tests:
```bash
# Health check
curl https://your-app.up.railway.app/

# Vector matching test
curl "https://your-app.up.railway.app/api/matches?producer_id=prod_001"

# System statistics
curl https://your-app.up.railway.app/api/matching-stats
```

### Frontend Tests:
1. Visit your Vercel URL
2. Check console for API connection logs
3. Test producer/consumer registration
4. Verify map and matching functionality

## Common Issues & Solutions

### Railway Issues:

**Issue**: `ModuleNotFoundError`
**Solution**: Ensure all dependencies are in `requirements.txt`

**Issue**: Vector files not persisting
**Solution**: Check `VECTOR_CACHE_DIR` environment variable

**Issue**: Database not found
**Solution**: Verify `database.json` is in the repository

### Vercel Issues:

**Issue**: API calls failing
**Solution**: Check `VITE_API_BASE_URL` environment variable

**Issue**: 404 on refresh
**Solution**: Verify `vercel.json` rewrites configuration

**Issue**: Build failing
**Solution**: Check Node.js version compatibility

## Monitoring & Maintenance

### Railway Monitoring:
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring:
- View deployment logs
- Monitor build performance
- Set up domain and SSL

## Update Process

### Backend Updates:
1. Make changes to backend code
2. Git commit and push
3. Railway auto-deploys from Git
4. Verify deployment in Railway dashboard

### Frontend Updates:
1. Make changes to frontend code
2. Git commit and push
3. Vercel auto-deploys from Git
4. Verify deployment in Vercel dashboard

## Success Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] Vector system working
- [ ] Database accessible
- [ ] Frontend connecting to backend
- [ ] All features functional

## Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Verify environment variables
3. Test API endpoints individually
4. Review configuration files

Your CarbonCapture Marketplace should now be fully deployed and operational! 