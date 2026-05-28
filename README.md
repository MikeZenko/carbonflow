# CarbonFlow - Carbon Capture Innovations Marketplace

**Live Application:** [carbonflow.net](https://carbonflow.net)

CarbonFlow is a cutting-edge AI-powered platform that connects carbon capture technology producers with industrial consumers, facilitating sustainable partnerships through intelligent matching and comprehensive impact analysis.

## Features

### **Core Functionality**
- **Vector-Based AI Matching**: Advanced 32-dimensional semantic matching algorithm
- **Interactive Dashboard**: Real-time visualization of carbon capture opportunities
- **Impact Analysis**: Comprehensive environmental and economic impact reporting
- **Geospatial Mapping**: Location-based matching with distance calculations
- **Smart Caching**: Session-based report caching for improved user experience

### **Authentication & Security**
- **JWT-based Authentication**: Secure user registration and login
- **Role-based Access**: Producer and consumer user types
- **Session Management**: Persistent login with secure token handling

### **Analytics & Reporting**
- **Partnership Impact Reports**: Detailed analysis of carbon reduction potential
- **Financial Modeling**: Cost-benefit analysis with ROI calculations
- **Logistics Planning**: Transportation and infrastructure considerations
- **Watchlist Management**: Save and track potential partnerships
- **Vector Statistics**: Real-time matching system performance metrics

### **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Viewport-Locked Dashboard**: Immersive full-screen experience
- **Progressive Web App**: Fast loading with offline capabilities
- **Intuitive Navigation**: Clean, modern interface design
- **Visual Match Scores**: Progress bars showing compatibility factors

## Tech Stack

### **Frontend**
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Leaflet** - Interactive mapping and geolocation
- **CSS3** - Custom styling with responsive design
- **Vercel** - Production deployment and hosting

### **Backend**
- **Python Flask** - Lightweight web framework
- **NumPy & SciPy** - Vector calculations and scientific computing
- **Scikit-learn** - Machine learning utilities
- **Azure OpenAI** - AI-powered analysis and matching
- **Geopy** - Geographic calculations and geocoding
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing and security
- **Railway** - Production deployment and hosting

### **Database & Storage**
- **JSON-based Storage** - Lightweight data persistence
- **Vector Cache System** - Pickle-based vector storage
- **Session Storage** - Client-side caching
- **Local Storage** - User preferences and watchlists

## Architecture

### **Frontend Architecture**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MapView.jsx      # Interactive Leaflet map
│   │   ├── Sidebar.jsx      # Analysis results panel with vector scores
│   │   ├── ProducerList.jsx # Producer selection interface
│   │   └── ImpactModal.jsx  # Report visualization
│   ├── pages/               # Route-based page components
│   │   ├── HomePage.jsx     # Main dashboard
│   │   ├── LandingPage.jsx  # Marketing landing page
│   │   └── AnalyticsPage.jsx # Analytics dashboard
│   ├── utils/               # Utility functions
│   │   ├── auth.js          # Authentication helpers
│   │   └── reportCache.js   # Session caching system
│   └── api.js               # API communication layer
```

### **Backend Architecture**
```
backend/
├── app.py                   # Main Flask application
├── auth.py                  # Authentication logic
├── vector_engine.py         # Vector generation and similarity calculations
├── matching_engine.py       # Advanced matching algorithms
├── database.json            # Data storage
├── vectors/                 # Vector cache storage
│   ├── producer_vectors.pkl # Producer embeddings
│   └── consumer_vectors.pkl # Consumer embeddings
└── requirements.txt         # Python dependencies
```

## Deployment

### **Quick Deploy**
```bash
# Run automated deployment script
./deploy.sh
```

### **Manual Deployment**

#### **Backend to Railway**
1. Create Railway account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   - `JWT_SECRET_KEY` (required)
   - `AZURE_OPENAI_ENDPOINT` (optional)
   - `AZURE_OPENAI_API_KEY` (optional)
4. Deploy automatically from Git

#### **Frontend to Vercel**
1. Create Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Set environment variables:
   - `VITE_API_BASE_URL` (your Railway backend URL)
4. Deploy automatically from Git

### **Production URLs**
- **Frontend**: https://carbonflow.net
- **Backend**: https://carbonflow-production.up.railway.app

### **Infrastructure**
- **Frontend Hosting**: Vercel with automatic deployments
- **Backend Hosting**: Railway with continuous deployment
- **CDN**: Vercel Edge Network for global distribution
- **SSL**: Automatic HTTPS with Let's Encrypt
- **SPA Routing**: Configured for client-side routing
- **Vector Storage**: Railway persistent disk for vector caching

## Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### **Frontend Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/CarbonCapture-Innovations-Marketplace.git
cd CarbonCapture-Innovations-Marketplace/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export AZURE_OPENAI_ENDPOINT="your-endpoint"
export AZURE_OPENAI_API_KEY="your-api-key"
export JWT_SECRET_KEY="your-secret-key"

# Run development server
python app.py
```

### **Environment Variables**
Create a `.env` file in the backend directory (copy from `env.example`):
```env
# Required for authentication
JWT_SECRET_KEY=your-secure-jwt-secret-key

# Optional for AI features
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# System configuration
FLASK_DEBUG=False
DATABASE_FILE=database.json
VECTOR_CACHE_DIR=./vectors
```

## API Endpoints

### **Authentication**
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/profile` - Get user profile (protected)

### **Data & Matching**
- `GET /api/producers` - List all producers
- `GET /api/consumers` - List all consumers  
- `GET /api/matches` - Vector-based matching with scores
- `POST /api/analyze-matches` - AI-powered analysis

### **Vector System**
- `POST /api/rebuild-vectors` - Rebuild vector cache
- `GET /api/matching-stats` - Vector system statistics

### **Impact Analysis**
- `POST /api/impact-model` - Generate partnership impact report
- `GET /api/analytics` - Get analytics data

## Testing

### **Run Tests**
```bash
# Test backend vector system
cd backend
python -c "from vector_engine import VectorEngine; from matching_engine import AdvancedMatcher; print('Vector system working')"

# Test frontend build
cd frontend
npm run build
```

### **API Testing**
```bash
# Test vector matching
curl "https://your-app.up.railway.app/api/matches?producer_id=prod_001"

# Test system statistics
curl "https://your-app.up.railway.app/api/matching-stats"
```

## Performance

- **Vector Generation**: 32-dimensional producer vectors, 28-dimensional consumer vectors
- **Matching Speed**: O(n) complexity with numpy optimizations
- **Storage**: File-based vector caching for Railway compatibility
- **Memory Usage**: Optimized for Railway's resource constraints
- **Match Quality**: 65% average match score with differentiated rankings

## Maintenance

### **Vector System**
- Vectors automatically rebuild when data changes
- Use `/api/rebuild-vectors` to manually refresh
- Monitor `/api/matching-stats` for system health

### **Deployment Updates**
- Backend: Push to Git → Railway auto-deploys
- Frontend: Push to Git → Vercel auto-deploys

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[VECTOR_SYSTEM_README.md](backend/VECTOR_SYSTEM_README.md)** - Vector system documentation
- **[INSTALLATION.md](INSTALLATION.md)** - Development setup guide

---

**Built with for a sustainable future** 
