# CarbonCapture Innovations Marketplace

A **production-ready** B2B platform connecting CO₂ producers with consumers to create a circular carbon economy. Developed for the Code4Hope 2025 Hackathon.

## 🚀 Enhanced Features (NEW!)

### 🔐 Complete Authentication System
- **Secure Login/Registration** with JWT tokens
- **User Profile Management** 
- **Session Handling** with auto-logout on token expiry
- **Demo Account**: `demo@carboncapture.com` / `demo123`

### 🛡️ Production-Ready Security
- **Environment Variables** for sensitive data
- **Password Hashing** with bcrypt
- **API Protection** with JWT authentication
- **CORS Configuration** for secure cross-origin requests

### 🎨 Enhanced User Experience
- **Modern Login Modals** with smooth animations
- **Responsive Design** for all devices
- **Error Handling** with user-friendly messages
- **Loading States** and visual feedback
- **Improved UI/UX** with professional styling

## Problem Focus
Tackling the challenge from CarbonCapture Innovations, we address the high cost of carbon capture by creating a market for captured CO₂, turning an environmental liability into a financial asset.

## Core Features
* **🏭 Producer/Consumer Registration:** Secure business entity registration
* **🗺️ Interactive Matchmaking Map:** AI-powered geographic partner visualization
* **🤖 AI-Powered Analysis:** Smart supply/demand matching with strategic insights
* **📊 Impact Modeling:** Calculate financial and environmental benefits
* **⭐ Watchlist System:** Save and compare potential partnerships
* **🔍 Advanced Analytics:** Deep market insights and recommendations

## Tech Stack
* **Frontend:** React 19, Vite, Leaflet.js, React Router
* **Backend:** Python, Flask, JWT Authentication
* **Database:** JSON file-based (easily migrated to PostgreSQL/MongoDB)
* **AI Integration:** Azure OpenAI for intelligent matching
* **Security:** bcrypt, JWT tokens, environment variables

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CarbonCapture-Innovations-Marketplace-main
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Create .env file with your configuration
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials
   
   python app.py
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://127.0.0.1:5000`

### 🔐 Demo Login
- **Email**: `demo@carboncapture.com`
- **Password**: `demo123`

## 📚 Documentation
- **[Complete Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- **[API Documentation](backend/app.py)** - Backend API endpoints
- **[Frontend Components](frontend/src/components/)** - React component structure

## 🔒 Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Environment variable configuration
- Protected API endpoints
- Secure session management
- CORS protection

## 🌟 What's New in This Version
- ✅ Full user authentication system
- ✅ Secure API with JWT tokens
- ✅ Modern UI with professional styling
- ✅ Complete requirements.txt with all dependencies
- ✅ Environment variable configuration
- ✅ Comprehensive installation documentation
- ✅ Demo account for easy testing
- ✅ Production-ready security practices

## 🚀 Ready for Production
This enhanced version is production-ready with:
- Proper security implementation
- Environment-based configuration
- Error handling and validation
- Responsive design
- Complete documentation
- Easy deployment setup