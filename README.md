# 🤖 VerifiAI - Fake News Detection System

An AI-powered Fake News Detection Platform that combines Machine Learning, NLP, Gemini AI, and real-time credibility verification to analyze and classify news authenticity.

---

# 🚀 Project Highlights

- AI-Powered Fake News Detection
- Machine Learning + NLP Integration
- Gemini AI Summarization
- Real-Time News Verification
- User Authentication System
- Analytics & History Tracking
- Responsive Modern UI
- Credibility Scoring System

---

# 🖼️ Project Screenshots

## 🏠 Home Page

<p align="center">
  <img src="screenshots/Home%20Page.png" width="850" />
</p>

---

## 🌐 Landing Page

<p align="center">
  <img src="screenshots/Landing%20Page.png" width="850" />
</p>

---

## 📊 Fetch Details Page

<p align="center">
  <img src="screenshots/Fetch%20Details%20Page.png" width="850" />
</p>

---

## 📝 Details Analysis Page

<p align="center">
  <img src="screenshots/Details%20Page.png" width="850" />
</p>

---

## 📜 History Details Page

<p align="center">
  <img src="screenshots/History%20Details%20Page.png" width="850" />
</p>

---

## ⚠️ Guest Limit Exceed Page

<p align="center">
  <img src="screenshots/Exceed%20Limit%20Page.png" width="850" />
</p>

---

# 🔎 Project Overview

VerifiAI is a comprehensive fake news detection system designed to identify and verify the authenticity of news articles and claims using:

- Machine Learning Models
- Natural Language Processing
- AI-Powered Summarization
- Real-Time API Verification
- Credibility Score Analysis

The system provides users with detailed claim analysis, manipulation risk detection, and credibility insights through an interactive full-stack platform.

---

# ✨ Key Features

- Fake vs Real News Prediction
- AI Summary Generation
- NewsAPI Verification
- Credibility Score System
- Manipulation Risk Analysis
- Claim Categorization
- Google OAuth Authentication
- Analysis History Tracking
- Guest User Access Limit
- Responsive Modern Interface

---

# 🧠 Machine Learning Features

- Logistic Regression Model
- TF-IDF Vectorization
- NLP Text Processing
- Confidence Score Prediction
- Real-Time Inference
- Model Serialization using Joblib

---

# 🛠️ Technology Stack

## Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Tailwind CSS

## Backend
- Node.js
- Express.js
- JWT Authentication
- Axios

## AI & Machine Learning
- Python
- Flask
- Scikit-learn
- NLP
- Gemini AI

## Database
- MySQL

## External APIs
- Gemini API
- NewsAPI
- Google OAuth 2.0

---

# 📦 Installation

## Clone Repository

```bash
git clone <repository-url>
cd fake-news-detection
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=fake_news_db

JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=your_google_client_id

GEMINI_API_KEY=your_gemini_api_key
NEWS_API_KEY=your_news_api_key
```

Start backend:

```bash
npm run dev
```

---

## ML Service Setup

```bash
cd ml_service
pip install -r requirements.txt
```

Train model:

```bash
python train.py
```

Start ML service:

```bash
python app.py
```

---

## Database Setup

Import:

```text
fake_news_db.sql
```

into MySQL.

---

# 🌐 Application Access

Frontend & Backend:

```text
http://localhost:5000
```

ML Service:

```text
http://localhost:5001
```

---

# 📊 Core Modules

- Authentication Module
- News Analysis Module
- AI Summary Module
- Verification Module
- History & Analytics Module
- ML Prediction Service
- Credibility Scoring Engine

---

# 🔐 Security Features

- JWT Authentication
- Google OAuth 2.0
- HTTP-only Cookies
- Input Validation
- SQL Injection Prevention
- Secure API Handling

---

# 📁 Project Structure

```text
backend/        → Express.js Backend
frontend/       → HTML/CSS/JS Frontend
ml_service/     → Flask ML Service
database.sql    → Database Schema
models/         → ML Models
```

---

# 📈 Future Enhancements

- Browser Extension
- Deep Learning Models
- Mobile Application
- Multi-language Support
- Social Media Verification
- Redis Caching
- Real-Time Trending Analysis

---

# 👨‍💻 Author

## Sujeet Atwe

Full Stack & AI Developer focused on scalable applications, enterprise systems, and AI-powered solutions.

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub.
