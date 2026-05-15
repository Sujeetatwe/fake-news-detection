# VerifiAI - Fake News Detection System
## Comprehensive Project Documentation (VIVA Preparation)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Frontend Architecture](#frontend-architecture)
7. [Machine Learning Component](#machine-learning-component)
8. [Key Features](#key-features)
9. [Project Structure](#project-structure)
10. [Setup & Installation Guide](#setup--installation-guide)
11. [Usage Instructions](#usage-instructions)
12. [Security Implementation](#security-implementation)
13. [Performance & Scalability](#performance--scalability)
14. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### What is VerifiAI?
VerifiAI is a **Full-Stack Fake News Detection System** designed to identify and verify the authenticity of news articles and claims. It combines machine learning, AI-powered analysis, and real-time API verification to provide users with comprehensive credibility assessments.

### Purpose
- **Detect Fake News**: Uses ML models to classify news as "Fake" or "Real"
- **Verify Claims**: Integrates with real-time news APIs for fact-checking
- **Analyze Credibility**: Provides detailed credibility scores and summaries
- **Track History**: Maintains user-specific analysis history
- **User Authentication**: Secure login via Google OAuth 2.0

### Target Users
- General users seeking to verify news authenticity
- Researchers and journalists
- Students and academic institutions
- Media organizations for content verification

### Key Metrics
- Real-time news detection and analysis
- Multiple verification layers (ML + API + AI)
- User-friendly interface with detailed reports
- Persistent history tracking for authenticated users

---

## 2. System Architecture

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                               │
│  (HTML/CSS/JavaScript - Tailwind CSS, Modern UI)                │
│  ├── Homepage (News Input & Analysis)                           │
│  ├── History Page (Analytics & Results)                         │
│  └── User Authentication (Google Sign-In)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │ (HTTP/REST API)
┌────────────────────▼────────────────────────────────────────────┐
│                   BACKEND LAYER (Express.js)                    │
│  ├── Authentication Module (JWT + Google OAuth)                 │
│  ├── News Analysis Module (ML Integration)                      │
│  ├── API Verification Module (NewsAPI Integration)              │
│  ├── AI Summary Module (Gemini AI)                              │
│  ├── Cache Module (Response Caching)                            │
│  ├── History & Analytics Module                                 │
│  └── Database Abstraction Layer                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
┌───────▼──┐  ┌──────▼─────┐ ┌──▼──────────┐ ┌─▼────────────┐
│ ML Service│ │   MySQL    │ │  Gemini AI  │ │  NewsAPI     │
│ (Flask)   │ │  Database  │ │  (Summaries)│ │  (Verification)
│ (Logistic │ │  (Market)  │ │  (Claims)   │ │  (Credibility)
│ Regression│ │            │ │             │ │              │
└──────────┘ └────────────┘ └─────────────┘ └──────────────┘
```

### Component Interaction Flow
```
User Input (News Text)
    ↓
Frontend Validation
    ↓
Express Backend Receives Request
    ├── Check Cache (if exists, return cached result)
    ├── Call ML Service (Fake/Real Classification)
    ├── Call Gemini AI (Get AI Summary + Credibility Score)
    ├── Call NewsAPI (Verify against trusted sources)
    └── Calculate Final Credibility Score & Risk Level
    ↓
Database Storage (Log the analysis)
    ↓
Response to Frontend (with all metadata)
    ↓
Frontend UI Rendering (Display results with visual indicators)
```

---

## 3. Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Tailwind CSS for utility-first styling
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Google Identity Services**: OAuth 2.0 authentication
- **Fetch API**: HTTP client for backend communication

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js (v4.19.2)**: Web application framework
- **MySQL2 (v3.9.7)**: Database driver
- **JWT (v9.0.3)**: Token-based authentication
- **Google Auth Library**: OAuth 2.0 client
- **Axios (v1.6.8)**: HTTP client for external APIs
- **Gemini API**: AI-powered text analysis and summarization
- **Node Cron (v4.2.1)**: Scheduled task runner
- **CORS (v2.8.5)**: Cross-Origin Resource Sharing
- **Cookie-Parser (v1.4.7)**: Cookie middleware
- **Dotenv (v16.4.5)**: Environment variable management

### Machine Learning Service
- **Python 3.x**: Python interpreter
- **Flask**: Lightweight web framework
- **Scikit-learn**: ML algorithms and utilities
- **TF-IDF Vectorizer**: Text feature extraction
- **Logistic Regression**: Binary classification model
- **Pandas**: Data manipulation
- **NLTK**: Natural Language Processing
- **Joblib**: Model serialization/deserialization

### Database
- **MySQL/MariaDB**: Relational database management
- **XAMPP**: Local development environment (includes MySQL)

### External APIs
- **Gemini API**: For AI-powered analysis and summarization
- **NewsAPI**: For real-time news verification and credibility checking
- **Google OAuth 2.0**: For secure user authentication

### Development Tools
- **Nodemon (v3.1.0)**: Auto-restart development server
- **VS Code**: Recommended IDE
- **Postman**: API testing tool (optional)

---

## 4. Database Design

### Database Name
`fake_news_db`

### Tables Overview

#### Table 1: `news_checks`
Stores all news analysis records

| Column Name | Type | Constraint | Purpose |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each analysis |
| `news_text` | TEXT | NOT NULL | Original news text analyzed |
| `prediction` | ENUM('Fake', 'Real') | DEFAULT NULL | ML model prediction |
| `confidence` | FLOAT | DEFAULT NULL | Confidence score (0-1) of prediction |
| `api_verification` | VARCHAR(255) | DEFAULT 'Pending' | Credibility status from NewsAPI |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `ai_summary` | TEXT | DEFAULT NULL | AI-generated summary of analysis |
| `credibility_score` | INT | DEFAULT 50 | Overall credibility score (0-100) |
| `claim_category` | VARCHAR(50) | DEFAULT 'Other' | Category: Politics, Health, Science, Economy, Other |

### Indexes
- **PRIMARY KEY**: `id` (auto-increment, fastest retrieval)
- **INDEX**: `idx_news_text` (255 char prefix, for searching news text)

### Sample Data
The database includes sample records from various categories:
- Political news (Nitish Kumar, Rahul Gandhi, MoS Ravneet Bittu)
- Space exploration (NASA water on moon, Mars colonization)
- Science & Technology (Starship launches)
- Health (Aging cure conspiracy)

### Database Schema Creation
```sql
CREATE TABLE `news_checks` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `news_text` text NOT NULL,
  `prediction` enum('Fake','Real') DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `api_verification` varchar(255) DEFAULT 'Pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ai_summary` text DEFAULT NULL,
  `credibility_score` int(11) DEFAULT 50,
  `claim_category` varchar(50) DEFAULT 'Other',
  INDEX `idx_news_text` (`news_text`(255))
)
```

### Data Flow
1. User submits news text via frontend
2. Backend analyzes and stores in `news_checks` table
3. Each analysis includes: prediction, confidence, AI summary, credibility score
4. Users can retrieve history from this table
5. Analytics dashboard aggregates statistics from this table

---

## 5. API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Module (MODULE 1-3)

#### 1. Google OAuth Authentication
**Endpoint**: `POST /api/auth/google`

**Purpose**: Authenticate user via Google OAuth 2.0

**Request Body**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3YTdmMzU1ZGI..."
}
```

**Response (Success 200)**:
```json
{
  "status": "success",
  "message": "Authentication successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Security Features**:
- JWT token issued with 24-hour expiration
- HTTP-only cookies (prevents XSS attacks)
- Secure cookie flag in production (HTTPS only)
- SameSite=strict (prevents CSRF)

---

#### 2. Get Current User
**Endpoint**: `GET /api/auth/me`

**Purpose**: Retrieve authenticated user information

**Headers**:
```
Cookie: token=<jwt_token>
```

**Response (Success 200)**:
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "https://..."
  }
}
```

**Response (Unauthorized 401)**:
```json
{
  "error": "Unauthorized: No token provided"
}
```

---

#### 3. Logout
**Endpoint**: `POST /api/auth/logout`

**Purpose**: Clear authentication token

**Response (Success 200)**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### News Analysis Module (MODULE 4-5)

#### 4. Check News (Main Analysis Endpoint)
**Endpoint**: `POST /api/check-news`

**Purpose**: Analyze news text for authenticity

**Request Body**:
```json
{
  "text": "Iran President apologises for strikes on neighbours"
}
```

**Response (Success 200)**:
```json
{
  "status": "success",
  "data": {
    "prediction": "Fake",
    "confidence": 0.95,
    "api_verification": "Low Credibility (No Trusted Sources Found)",
    "ai_summary": "The claim that Iran's President has apologized... [full summary]",
    "credibility_score": 50,
    "matched_sources": [],
    "category": "Politics",
    "manipulation_risk": "HIGH",
    "is_cached": false
  }
}
```

**Analysis Pipeline**:
1. **ML Prediction**: TF-IDF + Logistic Regression (predicts Fake/Real)
2. **AI Summary**: Gemini API analyzes and provides detailed reasoning
3. **Credibility Verification**: NewsAPI searches for supporting sources
4. **Risk Assessment**: Evaluates manipulation indicators
5. **Score Calculation**: Combines all metrics into final credibility score

**Error Responses**:
- `400 Bad Request`: Missing or invalid text
- `500 Internal Server Error`: ML service unavailable

---

### History & Analytics Module (MODULE 6)

#### 5. Get User History
**Endpoint**: `GET /api/history`

**Purpose**: Retrieve authenticated user's analysis history

**Headers**:
```
Cookie: token=<jwt_token>
```

**Response (Success 200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 23,
      "news_text": "Iran President apologises...",
      "prediction": "Fake",
      "confidence": 0.95,
      "credibility_score": 50,
      "category": "Politics",
      "created_at": "2026-03-07T08:58:31.000Z"
    }
  ],
  "analytics": {
    "total_claims": 31,
    "fake_news": 15,
    "real_news": 16,
    "avg_credibility": 68
  }
}
```

**Features**:
- Pagination-ready data structure
- Analytics dashboard metrics
- User-specific history

---

#### 6. Get Guest History
**Endpoint**: `POST /api/history/guest`

**Purpose**: Retrieve history for anonymous users

**Request Body**:
```json
{
  "ids": [23, 24, 25, 26]
}
```

**Response (Success 200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 23,
      "news_text": "...",
      "prediction": "Fake",
      "confidence": 0.95,
      "credibility_score": 50,
      "category": "Politics",
      "created_at": "2026-03-07T08:58:31.000Z"
    }
  ]
}
```

**Implementation Note**:
- Guest users store analysis IDs in localStorage
- Maximum 3 free analyses per session (enforced in frontend)
- Encourages user registration for unlimited access

---

### Health Check

#### 7. Server Health Status
**Endpoint**: `GET /health`

**Purpose**: Verify backend is running

**Response (Success 200)**:
```json
{
  "status": "success",
  "message": "Express server is running"
}
```

---

### ML Service APIs

#### 8. ML Service Health Check
**Endpoint**: `GET http://localhost:5001/health`

**Response**:
```json
{
  "status": "success",
  "message": "Python ML service is running",
  "model_loaded": true
}
```

---

#### 9. ML Prediction Endpoint
**Endpoint**: `POST http://localhost:5001/predict`

**Purpose**: Direct ML model inference (called by backend)

**Request Body**:
```json
{
  "text": "Breaking news: President announces new policy"
}
```

**Response**:
```json
{
  "prediction": "Real",
  "confidence": 0.92
}
```

**Internal Use Only**: Backend calls this endpoint; not exposed to frontend

---

## 6. Frontend Architecture

### Pages Overview

#### 1. **Homepage (index.html)**
**Path**: `/` or `/index.html`

**Components**:
- **Navigation Bar**: Logo, nav links, user authentication
- **Hero Section**: Main news input form
- **Input Module**: Textarea for news text input
- **Analysis Results Module**: Real-time prediction display
- **Details Section**: Comprehensive analysis breakdown
  - AI Summary
  - Credibility Score (0-100)
  - Manipulation Risk Assessment
  - API Verification Status
  - Claim Category Badge
  - Risk Level Indicator

**Key Features**:
- Real-time form validation
- Loading indicator during analysis
- Dynamic styling based on prediction (Red for Fake, Green for Real)
- Cache indicator for repeated analyses
- Guest search limit (3 free analyses)
- Modal for signup prompts

---

#### 2. **History Page (history.html)**
**Path**: `/history`

**Components**:
- **Analytics Dashboard**:
  - Total claims analyzed
  - Fake news count
  - Real news count
  - Average credibility score
- **Results Table**:
  - News text preview (truncated)
  - Prediction with confidence
  - Credibility score
  - Category
  - Date/time of analysis
  - Action buttons (View Details, Copy)
- **Pagination**: 8 items per page
- **Details Modal**: View full analysis details
- **Guest vs. Authenticated User View**:
  - Authenticated users: see their personal history + analytics
  - Guest users: see cached results from localStorage

---

### JavaScript Modules

#### **app.js** (Main Application Logic)
```javascript
// Key Functions:
- DOMContentLoaded event listener
- Form submission handler
- Guest search limit enforcement (MODULE 4)
- API call to /api/check-news (MODULE 5)
- Result rendering with dynamic styling
- Cache badge display (MODULE 5)
- Credibility score visualization
- Risk level calculation
- Manipulation risk assessment
- User navigation based on auth status (MODULE 7)
```

**Module 1-7 Features**:
- Module 1: Google Sign-In button initialization
- Module 2: Dynamic user navbar based on auth status
- Module 3: Claim category and risk level badges
- Module 4: Guest search limit enforcement (3 free checks)
- Module 5: Cache management for repeated queries
- Module 6: Real-time API verification status display
- Module 7: User authentication integration

---

#### **history.js** (History Page Logic)
```javascript
// Key Functions:
- Load user history from /api/history
- Fallback to guest history from localStorage
- Populate analytics dashboard (MODULE 6)
- Render paginated results table
- Modal for detailed view
- Table row click handlers
- Copy to clipboard functionality
- User authentication check
```

**Data Handling**:
- Fetches either user-specific or guest history
- Displays analytics metrics
- Manages pagination (8 items per page)
- Modal interaction for detailed results

---

### Styling

#### **style.css**
- **Framework**: Tailwind CSS (utility-first)
- **Dark Mode**: Class-based dark mode implementation
- **Custom Colors**:
  - Primary: `#0dccf2` (Cyan)
  - Background Dark: `#101f22`
  - Background Light: `#f5f8f8`
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Responsive Design**: Mobile-first, responsive at all breakpoints
- **Material Icons**: Google Material Symbols Outlined

**Key Styles**:
```css
.glass-card: Semi-transparent card with blur effect
.text-gradient: Cyan to turquoise gradient text
.primary: Accent color #0dccf2
Dark mode toggle: html.dark class
```

---

## 7. Machine Learning Component

### Model Architecture

#### **Algorithm**: Logistic Regression (Binary Classification)
- **Input**: TF-IDF vectorized text features
- **Output**: Probability of "Fake" or "Real"
- **Training Data**: news_sample.csv (fake and real news articles)
- **Classes**: Binary (Fake: 0, Real: 1)

#### **Text Preprocessing Pipeline**
1. **Lowercasing**: Convert all text to lowercase
2. **Tokenization**: Split text into individual words
3. **Stopword Removal**: Remove common English words
4. **Alphabetic Filter**: Keep only alphabetic characters
5. **Output**: Clean, processed text string

#### **Feature Extraction**
- **Vectorizer**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Max Features**: 5000 most important features
- **Output**: Sparse matrix of feature vectors

#### **Model Training** (train.py)
```python
# 1. Load data from CSV (columns: 'text', 'label')
# 2. Preprocess each text sample
# 3. Split data: 80% train, 20% test
# 4. Vectorize with TF-IDF (max_features=5000)
# 5. Train Logistic Regression model
# 6. Evaluate: accuracy, precision, recall, F1-score
# 7. Save model and vectorizer using joblib
```

#### **Model Persistence**
- **Model File**: `models/model.pkl` (Logistic Regression serialized)
- **Vectorizer File**: `models/vectorizer.pkl` (TF-IDF vectorizer)
- **Method**: Joblib serialization/deserialization
- **Load Time**: On Flask app startup

### Flask ML Service (app.py)

#### **Endpoints**

1. **Health Check**: `GET /health`
   - Verifies ML service is running
   - Checks if model is loaded

2. **Prediction**: `POST /predict`
   - Input: `{"text": "news article"}`
   - Output: `{"prediction": "Real/Fake", "confidence": 0.85}`
   - Process:
     1. Vectorize input text using loaded vectorizer
     2. Predict using loaded model
     3. Get probability scores
     4. Return top prediction + confidence

#### **Error Handling**
- Model not found: Returns 500 with error message
- Invalid input: Returns 400 with validation error
- Processing errors: Returns 500 with exception message

### Performance Metrics
- **Accuracy**: Model trained on historical data
- **Confidence Score**: Probability of predicted class (0-1)
- **Training Time**: Depends on dataset size
- **Inference Time**: < 100ms per prediction

### Dataset
- **File**: `dataset/sample_news.csv`
- **Columns**: `text`, `label` (Fake/Real)
- **Size**: Varies (sample dataset provided)
- **Format**: CSV with headers

---

## 8. Key Features

### 1. **Multi-Layer Verification System**
   - **ML Prediction**: Fast, local classification
   - **AI Analysis**: Gemini AI for detailed reasoning
   - **API Verification**: NewsAPI for source credibility
   - **Combined Score**: Integrated credibility assessment

### 2. **Real-Time News Analysis**
   - Instant Fake/Real prediction
   - Detailed AI-generated summaries
   - Claim categorization (Politics, Health, Science, Economy)
   - Manipulation risk assessment

### 3. **Google OAuth 2.0 Authentication**
   - Secure login via Google
   - User profile storage
   - JWT token-based sessions (24-hour expiration)
   - HTTP-only secure cookies

### 4. **Guest Access with Limits**
   - 3 free analyses per session (localStorage-based)
   - No account required for basic usage
   - Encourages user registration for unlimited access

### 5. **Analysis Caching**
   - Repeated queries return cached results
   - Faster response times
   - Reduced API costs
   - Cache indicator on UI

### 6. **Comprehensive History Tracking**
   - User-specific analysis history
   - Guest history via localStorage
   - Pagination (8 items per page)
   - Analytics dashboard:
     - Total analyses
     - Fake vs. Real count
     - Average credibility score

### 7. **Advanced Credibility Scoring**
   - 0-100 scale credibility score
   - Risk level indicators (Low/Moderate/High)
   - Manipulation risk assessment
   - Category-based analysis

### 8. **Responsive Design**
   - Mobile-first approach
   - Dark mode support
   - Glass morphism UI
   - Tailwind CSS styling
   - Accessibility considerations

### 9. **Scheduled Tasks** (Module 9)
   - Node-cron scheduled jobs
   - Potential for periodic cache cleanup
   - Database optimization tasks
   - Report generation

### 10. **Comprehensive Error Handling**
   - User-friendly error messages
   - Server validation
   - Database error logging
   - Graceful degradation

---

## 9. Project Structure

```
fake_new_app/
│
├── backend/                    # Node.js/Express Backend
│   ├── server.js               # Main server file (9 modules)
│   ├── package.json            # Node dependencies
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── models.txt              # Available Gemini models
│   ├── setup_auth_tables.js    # SQL setup scripts
│   ├── setup_history_user.js   # History table setup
│   ├── add_*.js                # Database migration scripts
│   └── alter_db.js             # Database alteration utility
│
├── frontend/                   # Frontend (HTML/CSS/JS)
│   ├── index.html              # Homepage
│   ├── history.html            # History & Analytics page
│   ├── samplehome.html         # Sample template
│   ├── history_page_sample.html # History sample template
│   ├── css/
│   │   └── style.css           # Tailwind CSS styling
│   └── js/
│       ├── app.js              # Main app logic
│       └── history.js          # History page logic
│
├── ml_service/                 # Python ML Service
│   ├── app.py                  # Flask app (ML service)
│   ├── train.py                # Model training script
│   ├── requirements.txt         # Python dependencies
│   ├── dataset/
│   │   └── sample_news.csv    # Training dataset
│   └── models/
│       ├── model.pkl           # Trained Logistic Regression
│       └── vectorizer.pkl      # TF-IDF Vectorizer
│
├── database.sql                # Database schema (basic)
├── fake_news_db.sql            # Complete database dump
├── text/                       # Text files (documentation)
└── DOCUMENTATION.md            # This file
```

---

## 10. Setup & Installation Guide

### Prerequisites
- **Node.js** v14+ (for backend)
- **Python 3.x** (for ML service)
- **MySQL** (XAMPP recommended)
- **Git** (for version control)
- **Environment variables** (.env file)

### Step 1: Clone/Setup Project
```bash
cd fake_new_app
```

### Step 2: Backend Setup

#### Install Node Dependencies
```bash
cd backend
npm install
```

#### Create .env File
```bash
# backend/.env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=fake_news_db

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# JWT
JWT_SECRET=verifiai_super_secret_dev_key

# APIs
GEMINI_API_KEY=your_gemini_api_key
NEWS_API_KEY=your_news_api_key
```

#### Get API Keys
1. **Gemini API**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **NewsAPI**: Visit [NewsAPI.org](https://newsapi.org) and sign up
3. **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com)

#### Start Backend Server
```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

Backend runs on: `http://localhost:5000`

---

### Step 3: ML Service Setup

#### Install Python Dependencies
```bash
cd ml_service
pip install -r requirements.txt
```

#### requirements.txt
```
Flask
flask-cors
python-dotenv
scikit-learn
pandas
nltk
joblib
```

#### Train the Model
```bash
python train.py
# This generates:
# - models/model.pkl
# - models/vectorizer.pkl
```

#### Start ML Service
```bash
python app.py
```

ML Service runs on: `http://localhost:5001`

---

### Step 4: Database Setup

#### Option A: Using XAMPP
1. Start XAMPP (Apache + MySQL)
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Import `fake_news_db.sql`:
   - Create new database: `fake_news_db`
   - Go to Import tab
   - Select `fake_news_db.sql`
   - Click Import

#### Option B: Command Line
```bash
mysql -u root -p < fake_news_db.sql
```

#### Option C: Manual Setup
```sql
mysql -u root
SOURCE path/to/database.sql;
```

#### Verify Connection
```bash
cd backend
node config/db.js
# Should print: "Successfully connected to XAMPP MySQL database"
```

---

### Step 5: Start Frontend
The frontend is served by Express.js from the `backend` directory.

Access via: `http://localhost:5000`

---

### Complete Startup Sequence
```bash
# Terminal 1: ML Service
cd ml_service
python app.py

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Access Frontend
Open browser to: http://localhost:5000
```

---

## 11. Usage Instructions

### For End Users

#### 1. **First-Time Users (Guest)**
- Navigate to `http://localhost:5000`
- Enter a news headline or article text
- Click "Analyze News"
- View results (3 free analyses)
- Register for unlimited access

#### 2. **Registered Users**
- Click "Sign In with Google"
- Authenticate with Google account
- Unlimited analyses
- View personal history
- See analytics dashboard

#### 3. **Analyzing News**
1. Enter news text in the input field
2. Click "Analyze News" button
3. Wait for analysis (1-3 seconds)
4. View results:
   - Prediction badge (LIKELY FAKE / LIKELY REAL)
   - Confidence percentage
   - Credibility score (0-100)
   - Category (Politics, Health, Science, Economy, Other)
   - Risk level (Low, Moderate, High)
   - Manipulation risk
   - AI-generated summary
   - Matched sources (if any)

#### 4. **Viewing History**
- Click "History" in navigation
- See all past analyses
- View analytics dashboard
- Click on any item for detailed view
- Copy results to clipboard (optional)

### For Developers

#### Running Tests
```bash
# Backend API tests (using Postman or curl)
curl -X POST http://localhost:5000/api/check-news \
  -H "Content-Type: application/json" \
  -d '{"text": "Test news article"}'

# ML Service test
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Test article"}'
```

#### Common Debugging
1. **ML Service not loading models**: Run `python train.py`
2. **Database connection error**: Check MySQL is running
3. **API key errors**: Verify .env file has correct keys
4. **CORS errors**: Check backend CORS configuration
5. **Authentication issues**: Verify Google Client ID

---

## 12. Security Implementation

### Authentication & Authorization

#### 1. **Google OAuth 2.0**
- Secure third-party authentication
- No password storage (delegated to Google)
- Verifiable ID tokens
- User profile data validation

#### 2. **JWT Tokens**
- Token expiration: 24 hours
- Secret key for signing: `JWT_SECRET` from .env
- Payload: User ID + Google ID
- Verification on protected routes

#### 3. **Cookie Security**
```javascript
res.cookie('token', token, {
  httpOnly: true,        // Prevents XSS attacks
  secure: production,    // HTTPS only in production
  maxAge: 24h,          // Expiration time
  sameSite: 'strict'    // Prevents CSRF attacks
});
```

### Data Protection

#### 1. **Input Validation**
- Required field checks
- Text length validation
- Type checking
- Trimming whitespace

#### 2. **SQL Injection Prevention**
- Parameterized queries using mysql2
- No string concatenation in SQL
- Input sanitization

#### 3. **Rate Limiting** (Future Enhancement)
- Guest analysis limit: 3 per session
- Enforceable in production: Implement rate-limit middleware

### Environment Variables
- Never commit `.env` file
- API keys stored securely
- Different configurations for dev/prod
- Use strong JWT_SECRET in production

### CORS Configuration
```javascript
app.use(cors());
// Configurable for production (specific origins)
```

---

## 13. Performance & Scalability

### Current Performance

#### Response Times
- **Guest Limit Check**: < 10ms
- **Cache Lookup**: < 50ms (if cached)
- **ML Prediction**: 100-500ms
- **AI Summary Generation**: 1-3 seconds
- **API Verification**: 1-2 seconds
- **Total End-to-End**: 2-5 seconds

#### Database Performance
- Indexed on `news_text` (255 char prefix)
- Optimized for reads (analysis history)
- Connection pooling (max 10 connections)

### Scalability Considerations

#### Vertical Scaling
- Increase server resources (CPU, RAM)
- Higher database max connections
- Larger ML model capacity
- More concurrent API calls

#### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple backend instances
- Separate ML service instances
- Database replication

#### Caching Strategy
- Redis for repeated predictions
- Database query caching
- API response caching
- Frontend browser caching

#### Database Optimization
- Add more indexes
- Partition large tables
- Archive old records
- Query optimization

#### API Rate Limiting
- Implement rate-limit middleware
- Token bucket algorithm
- Per-user limits
- Per-IP limits

---

## 14. Future Enhancements

### Short-term (1-2 months)
1. **User Accounts Database**: Store user-specific settings
2. **Advanced Analytics**: Graphs and trend analysis
3. **Export Functionality**: PDF/CSV export of history
4. **Dark Mode Toggle**: Switch between light/dark themes
5. **Image Analysis**: Detect fake images/deepfakes
6. **API Rate Limiting**: Prevent abuse

### Medium-term (2-6 months)
1. **Browser Extension**: Quick news verification from any site
2. **Mobile App**: Native iOS/Android application
3. **Advanced ML Models**: Deep learning (LSTM/Transformer)
4. **Social Media Integration**: Analyze tweets, posts
5. **Multi-language Support**: Analyze non-English news
6. **Community Voting**: User-driven credibility scores
7. **Advanced Caching**: Redis implementation

### Long-term (6+ months)
1. **Real-time News Feed**: Automatic analysis of trending news
2. **Subscription Plans**: Premium features/analytics
3. **API for Third Parties**: Public API for developers
4. **AI Model Improvements**: Custom fine-tuning
5. **Blockchain Verification**: Immutable record of analyses
6. **Collaborative Features**: Team sharing and verification
7. **Advanced NLP**: Named entity recognition, sentiment analysis
8. **Source Tracking**: Follow claim origins

### Performance Improvements
- **Implement Redis**: Cache frequent queries
- **Database Optimization**: Partitioning, indexing
- **CDN**: Serve static assets globally
- **Lazy Loading**: Load components on demand
- **Code Splitting**: Reduce initial bundle size
- **Service Workers**: Offline functionality

### Security Enhancements
- **Two-Factor Authentication**: Additional security layer
- **Rate Limiting**: Prevent abuse
- **IP Whitelisting**: Restrict access
- **Audit Logging**: Track all actions
- **Encryption**: End-to-end encryption
- **GDPR Compliance**: Data privacy features
- **SSL/TLS**: Enforce HTTPS

---

## Conclusion

VerifiAI is a comprehensive fake news detection system combining machine learning, AI analysis, and real-time verification. With its modular architecture, secure authentication, and user-friendly interface, it provides an effective solution for verifying news authenticity.

The system is designed for scalability and extensibility, with clear paths for enhancement and integration with additional services. Both the technical implementation and user experience prioritize security, accuracy, and usability.

### Quick Reference Commands

```bash
# Start ML Service
cd ml_service && python app.py

# Train ML Model
cd ml_service && python train.py

# Start Backend
cd backend && npm run dev

# Install Backend Dependencies
cd backend && npm install

# Install ML Dependencies
cd ml_service && pip install -r requirements.txt

# Access Application
http://localhost:5000

# Test Endpoints
curl http://localhost:5000/health
curl http://localhost:5001/health
```

---

**Documentation Version**: 1.0
**Last Updated**: May 12, 2026
**Project**: VerifiAI - Fake News Detection System
**Author**: Development Team

---
