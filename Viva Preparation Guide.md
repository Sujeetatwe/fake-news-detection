# 🎓 VerifiAI — Fake News Detection System
## MSc Computer Science — Viva Preparation Guide

---

> [!IMPORTANT]
> This document is your complete viva preparation kit. Read it fully before your presentation. Speak confidently — you built this system.

---

## 📌 1. One-Line Project Introduction (Say This First)

> *"VerifiAI is a full-stack, AI-powered fake news detection system that combines machine learning, large language models, and real-time news API verification to assess the authenticity of any news article or claim with a credibility score."*

---

## 📖 2. Project Introduction (Explain in 2–3 Minutes)

### What is the Problem?
The digital age has made it extremely easy to spread misinformation. Fake news is shared rapidly on social media, WhatsApp, and news websites — causing panic, political manipulation, and social harm. Traditional fact-checking is slow, manual, and cannot scale.

### What is the Solution?
We developed **VerifiAI** — an intelligent web application that automatically verifies the authenticity of a news article using a **three-layer verification approach**:

1. **Machine Learning** — A trained Logistic Regression model classifies text as Fake or Real based on linguistic patterns
2. **Generative AI (Gemini)** — Google's Gemini LLM provides deep contextual reasoning and a confidence score
3. **NewsAPI Verification** — Cross-references the claim against trusted news sources like BBC, Reuters, NDTV in real time

The system then computes a final **Credibility Score (0–100)** and a **Manipulation Risk Level**, giving users a complete picture of the news's trustworthiness.

### Who Uses It?
- General public wanting to verify viral news
- Journalists and researchers
- Students and academic institutions
- Media organizations for editorial fact-checking

---

## 🏗️ 3. System Architecture (Draw This on the Board)

```
┌──────────────────────────────────────┐
│           USER (Browser)             │
│    Enters news text on frontend      │
└──────────────┬───────────────────────┘
               │  HTTP POST /api/check-news
               ▼
┌──────────────────────────────────────┐
│     BACKEND — Node.js + Express.js   │
│  (Orchestrator / Brain of the system)│
│                                      │
│  Step 1: Check DB Cache              │
│  Step 2: Call ML Service (Flask)     │
│  Step 3: Call Gemini AI API          │
│  Step 4: Call NewsAPI                │
│  Step 5: Calculate Credibility Score │
│  Step 6: Save to MySQL Database      │
│  Step 7: Return result to frontend   │
└──────┬────────┬──────────┬───────────┘
       │        │          │
       ▼        ▼          ▼
  ┌────────┐ ┌───────┐ ┌──────────┐
  │ Flask  │ │Gemini │ │ NewsAPI  │
  │ML Svc  │ │  AI   │ │(Reuters, │
  │(Python)│ │       │ │ BBC etc) │
  └────────┘ └───────┘ └──────────┘
       │
  ┌────────────┐
  │   MySQL    │
  │  Database  │
  └────────────┘
```

---

## 🔄 4. Complete Workflow — How It Checks Fake or Real

### Step-by-Step Flow (Memorize This):

```
USER submits news text
        │
        ▼
[STEP 1] ── Is this text already in DB Cache?
        │         YES ──► Return cached result instantly (fast path)
        │ NO
        ▼
[STEP 2] ── ML Service (Flask/Python) called
        │   • TF-IDF vectorizes the text
        │   • Logistic Regression predicts: Fake / Real
        │   • Returns: prediction + confidence (0.0 to 1.0)
        │
        ▼
[STEP 3] ── NewsAPI called (Real-time web search)
        │   • Extracts 6 keywords from the text
        │   • Searches BBC, Reuters, NDTV, The Hindu, etc.
        │   • If >5 articles found → "High Credibility"
        │   • If 1–5 articles found → "Moderate Credibility"
        │   • If 0 articles found → "Low Credibility / No Sources"
        │   • Calculates average source credibility score
        │
        ▼
[STEP 4] ── Gemini AI called (Deep Reasoning)
        │   • Receives: original text + NewsAPI context
        │   • Returns JSON: { prediction, confidence, summary, citations, category }
        │   • Provides human-readable explanation of WHY it's fake or real
        │
        ▼
[STEP 5] ── Clickbait / Manipulation Risk Analysis
        │   • Scans for manipulative keywords:
        │     "shocking", "secret cure", "you won't believe", "banned", "scandal"
        │   • If found → Manipulation Risk = HIGH, language_score = 0.3
        │   • If clean → Manipulation Risk = LOW, language_score = 1.0
        │
        ▼
[STEP 6] ── Credibility Score Calculated
        │
        │   Formula:
        │   Score = (AI_confidence × 50%) + (source_score × 30%) + (language × 20%)
        │
        │   Example:
        │   AI confidence = 0.90  → 0.90 × 50 = 45
        │   Source score  = 0.85  → 0.85 × 30 = 25.5
        │   Language      = 1.0   → 1.0  × 20 = 20
        │   ─────────────────────────────────────
        │   Final Score = 90 / 100 → HIGH CREDIBILITY ✅
        │
        ▼
[STEP 7] ── Save result to MySQL (news_checks table)
        │
        ▼
[STEP 8] ── Return JSON to Frontend
        │
        ▼
[STEP 9] ── Frontend renders result:
           • LIKELY REAL ✅ / LIKELY FAKE ❌
           • Credibility Score ring
           • Risk Level badge
           • AI-generated summary
           • Matched sources list
           • Claim category (Politics / Health / Science / etc.)
```

---

## 🧪 5. Machine Learning Component (Deep Theory)

### Algorithm: Logistic Regression

**What is Logistic Regression?**
Logistic Regression is a supervised machine learning algorithm used for binary classification problems. Unlike linear regression which predicts continuous values, logistic regression predicts the **probability** that an input belongs to a particular class (0 or 1 — in our case: Fake or Real).

It uses the **Sigmoid function** to map any input to a probability between 0 and 1:

```
σ(z) = 1 / (1 + e^(-z))

where z = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ
```

**Why Logistic Regression for Fake News?**
- Text data after TF-IDF is high-dimensional but sparse — LR handles this well
- Fast training and inference (< 100ms per prediction)
- Highly interpretable — we can see which words influence the prediction
- Performs comparably to complex deep learning models on structured TF-IDF features

---

### Feature Extraction: TF-IDF

**What is TF-IDF?**
TF-IDF stands for **Term Frequency – Inverse Document Frequency**. It converts raw text into numerical vectors that ML algorithms can process.

**TF (Term Frequency):**
```
TF(word, document) = (Number of times word appears in document) / (Total words in document)
```

**IDF (Inverse Document Frequency):**
```
IDF(word) = log(Total documents / Number of documents containing the word)
```

**TF-IDF Score:**
```
TF-IDF = TF × IDF
```

**Intuition:** A word like "the" appears everywhere (low IDF), so it gets a low score. A word like "election fraud" appears in specific fake news articles (high TF, high IDF), so it gets a high weight — making it a strong feature.

**In our project:** We use `max_features=5000` — meaning we track the 5000 most informative words.

---

### NLP Text Preprocessing

Before feeding text to TF-IDF, we clean it:

| Step | Input | Output |
|---|---|---|
| Lowercasing | "FAKE News Alert!" | "fake news alert!" |
| Tokenization | "fake news alert" | ["fake", "news", "alert"] |
| Stopword Removal | ["the", "is", "fake"] | ["fake"] |
| Alphabetic Filter | ["fake", "123", "news"] | ["fake", "news"] |

---

### Model Training Pipeline (train.py)

```
1. Load dataset (sample_news.csv) → columns: [text, label]
2. Preprocess all text samples
3. Split: 80% Training, 20% Testing
4. Fit TF-IDF Vectorizer on training data
5. Transform text → sparse feature matrix
6. Train Logistic Regression on feature matrix
7. Evaluate: Accuracy, Precision, Recall, F1-Score
8. Save model.pkl + vectorizer.pkl using Joblib
```

---

## 🔐 6. Security Implementation

### Authentication: Google OAuth 2.0 + JWT

**Why Google OAuth?**
- No password storage on our server (delegated to Google)
- Industry-standard security
- Verifiable cryptographic ID tokens

**How JWT Works:**
1. User signs in with Google → backend receives Google credential token
2. Backend verifies token with Google's OAuth server
3. Backend issues its own **JWT (JSON Web Token)** containing `user_id`
4. JWT is stored in an **HTTP-only cookie** (cannot be accessed by JavaScript → prevents XSS)
5. Every subsequent API call sends this cookie → backend verifies JWT → authorizes access

**Cookie Security Flags Used:**
```
httpOnly: true       ← Prevents XSS (JS cannot read this cookie)
secure: true         ← Only sent over HTTPS in production
sameSite: 'strict'   ← Prevents CSRF attacks
maxAge: 24 hours     ← Token expires after 24 hours
```

**SQL Injection Prevention:**
- All DB queries use **parameterized queries** (`?` placeholders)
- Input is never directly concatenated into SQL strings

---

## 💾 7. Database Design

### Table: `news_checks`

| Column | Type | Purpose |
|---|---|---|
| `id` | INT (PK, AUTO_INCREMENT) | Unique record ID |
| `news_text` | TEXT | Original article text |
| `prediction` | ENUM('Fake','Real') | ML prediction result |
| `confidence` | FLOAT | Confidence (0.0–1.0) |
| `api_verification` | VARCHAR(255) | NewsAPI result status |
| `ai_summary` | TEXT | Gemini-generated explanation |
| `credibility_score` | INT (0–100) | Final credibility score |
| `claim_category` | VARCHAR(50) | Politics/Health/Science/etc. |
| `user_id` | INT (FK → users.id) | NULL for guests |
| `created_at` | TIMESTAMP | Record creation time |

### Table: `users`

| Column | Type | Purpose |
|---|---|---|
| `id` | INT (PK) | Unique user ID |
| `google_id` | VARCHAR(255) UNIQUE | Google account identifier |
| `name` | VARCHAR(255) | Display name |
| `email` | VARCHAR(255) UNIQUE | Email address |
| `profile_picture` | TEXT | Avatar URL from Google |

---

## 🛠️ 8. Technology Stack Summary

| Layer | Technology | Role |
|---|---|---|
| Frontend | HTML5, Tailwind CSS, Vanilla JS | User interface |
| Backend | Node.js + Express.js | API server & orchestrator |
| ML Service | Python + Flask | Logistic Regression inference |
| Database | MySQL (via XAMPP) | Data persistence |
| AI Analysis | Google Gemini API | LLM-based fact reasoning |
| News Verification | NewsAPI.org | Real-time source lookup |
| Authentication | Google OAuth 2.0 + JWT | Secure user sessions |
| Scheduling | Node-Cron | Nightly DB cleanup jobs |

---

## ❓ 9. Expected Viva Questions & Model Answers

---

### 🔵 CATEGORY 1: Project Overview

**Q1. What is the objective of your project?**
> The objective is to build an automated fake news detection system that uses multiple AI layers — machine learning, large language models, and real-time API verification — to assess the credibility of news articles and provide users with a trust score.

**Q2. What problem does this project solve?**
> Manual fact-checking is slow, biased, and cannot scale with the volume of news shared online. Our system automates this process and provides instant, multi-source verified results with a credibility score.

**Q3. What makes your project different from a simple ML classifier?**
> Most fake news classifiers only use one ML model, which can be wrong. Our system uses a **three-layer approach**: ML model for fast initial classification, Gemini AI for deep contextual reasoning, and NewsAPI for real-time source cross-referencing. All three are combined into a weighted credibility score — making it far more robust.

---

### 🔵 CATEGORY 2: Machine Learning

**Q4. Why did you choose Logistic Regression over other algorithms?**
> Logistic Regression is well-suited for high-dimensional, sparse text data generated by TF-IDF. It's fast (sub-100ms inference), interpretable, and performs well for binary text classification. For our dataset size, it matches or exceeds complex models like SVM or neural networks while being computationally cheaper.

**Q5. What is TF-IDF and why is it used?**
> TF-IDF converts text into numeric feature vectors. TF measures how often a word appears in a document; IDF penalizes words that appear across all documents. Their product gives high scores to words that are unique and meaningful to specific documents — making it ideal for distinguishing fake news language patterns from real news.

**Q6. What is the Sigmoid function and why is it used in Logistic Regression?**
> The Sigmoid function maps any real number to a value between 0 and 1, representing a probability. In logistic regression, it converts the linear output (z = wX + b) into a probability. If the probability > 0.5, we classify as Real; if < 0.5, we classify as Fake.

**Q7. What metrics did you use to evaluate your model?**
> We used Accuracy, Precision, Recall, and F1-Score.
> - **Precision**: Of all articles predicted Fake, how many were actually Fake?
> - **Recall**: Of all actually Fake articles, how many did we correctly identify?
> - **F1-Score**: Harmonic mean of Precision and Recall — best for imbalanced datasets.

**Q8. What is the training/testing split and why?**
> We use 80% training and 20% testing. This is the standard split to ensure the model has enough data to learn patterns while keeping an unseen test set to measure generalization performance.

**Q9. What is Joblib and why do you use it?**
> Joblib is a Python library for efficient serialization of large NumPy arrays. We use it to save the trained `model.pkl` and `vectorizer.pkl` files to disk. This way, we don't retrain the model on every server start — we just load the pre-trained model at Flask startup.

**Q10. What are stop words? Give examples.**
> Stop words are common words in a language that carry little meaningful information for classification — such as "the", "is", "at", "and", "of". We remove them during preprocessing to reduce noise and focus TF-IDF on meaningful terms.

---

### 🔵 CATEGORY 3: System Design & Backend

**Q11. Why did you use Node.js for the backend?**
> Node.js is non-blocking and event-driven, making it ideal for I/O-heavy operations like calling multiple external APIs (Gemini, NewsAPI) simultaneously. Express.js provides a minimal framework for building RESTful APIs quickly.

**Q12. Why is the ML service separate from the main backend?**
> Python and Node.js are separate runtimes. We use Python for the ML service (Flask microservice on port 5001) because scikit-learn is a Python library. The Node.js backend (port 5000) orchestrates all calls. This is the **microservices architecture pattern** — each service does one job and can be scaled independently.

**Q13. What is REST API? How does your project use it?**
> REST (Representational State Transfer) is an architectural style for web services using HTTP methods (GET, POST, PUT, DELETE). Our backend exposes REST endpoints like `POST /api/check-news`, `GET /api/history`, `POST /api/auth/google` that the frontend consumes using the Fetch API.

**Q14. What is caching and why did you implement it?**
> Caching stores the result of expensive operations so repeated identical requests return instantly without re-running all API calls. When a user submits a previously analyzed article, our system finds it in MySQL and returns the cached result — saving 2–5 seconds and API costs (Gemini and NewsAPI have rate limits).

**Q15. What is CORS and why is it needed?**
> CORS (Cross-Origin Resource Sharing) is a browser security policy that blocks web pages from making requests to a different domain than the one that served the page. Our Express backend explicitly enables CORS so the frontend can communicate with it, even during development on different ports.

---

### 🔵 CATEGORY 4: Security

**Q16. What is JWT and how does it work?**
> JWT (JSON Web Token) is a compact, self-contained token for securely transmitting information. It has three parts: Header (algorithm), Payload (user data like `user_id`), and Signature (HMAC hash). Our backend signs the JWT with a secret key (`JWT_SECRET`). On every protected request, the backend verifies the signature — if valid, the user is authenticated.

**Q17. Why store JWT in HTTP-only cookies instead of localStorage?**
> localStorage is accessible by JavaScript, making it vulnerable to XSS (Cross-Site Scripting) attacks — malicious scripts could steal the token. HTTP-only cookies cannot be read by JavaScript, providing better security. We also add `sameSite: 'strict'` to prevent CSRF (Cross-Site Request Forgery) attacks.

**Q18. What is SQL Injection? How did you prevent it?**
> SQL Injection is an attack where malicious SQL code is inserted into an input field to manipulate the database. For example: `'; DROP TABLE users; --`. We prevent this using **parameterized queries** (`?` placeholders in mysql2) — the driver ensures user input is always treated as data, never as SQL code.

**Q19. What is OAuth 2.0?**
> OAuth 2.0 is an industry-standard authorization protocol that allows a third party (in our case, Google) to authenticate users on our behalf. Users never share their password with our application — they authenticate with Google, which gives us a verified identity token (credential) that we validate server-side.

---

### 🔵 CATEGORY 5: Database

**Q20. Why MySQL? Why not MongoDB?**
> Our data is highly structured — every news check has the same fields (text, prediction, confidence, score, category, timestamp). Relational databases like MySQL are ideal for structured, consistent data. The `users` and `news_checks` tables have a clear foreign key relationship. MongoDB (NoSQL) is better for unstructured or dynamic data.

**Q21. What is a Foreign Key constraint?**
> A Foreign Key is a field in one table that references the Primary Key in another table. In our schema, `news_checks.user_id` references `users.id`. This ensures referential integrity — you cannot have a `news_check` with a `user_id` that doesn't exist in the `users` table. We set `ON DELETE SET NULL` so if a user is deleted, their history records remain but `user_id` becomes NULL.

**Q22. Why did you add an INDEX on `news_text`?**
> Without an index, every cache lookup (`SELECT * FROM news_checks WHERE news_text = ?`) would do a full table scan — reading every row. With an index (`idx_news_text` on the first 255 characters), MySQL can find matching rows instantly using a B-tree structure, dramatically improving query speed.

---

### 🔵 CATEGORY 6: AI & APIs

**Q23. What is the Gemini API and how do you use it?**
> Google Gemini is a large language model (LLM). We send it a structured prompt containing the user's news text and real-time NewsAPI context. It returns a JSON object with: `prediction`, `confidence`, `summary`, `citations`, and `category`. We use it for deep semantic understanding that a simple ML model cannot provide.

**Q24. What is a prompt in the context of LLMs?**
> A prompt is the input text given to a large language model that guides its response. We carefully engineer our prompt to instruct Gemini to: (1) determine Fake/Real, (2) give a confidence score, (3) write a 2–3 sentence explanation, (4) cite sources, and (5) categorize the claim. This is called **Prompt Engineering**.

**Q25. What happens if the Gemini API fails or hits rate limits?**
> We implement a **fallback model chain**. If the primary model (`gemini-1.5-flash`) is rate-limited (HTTP 429), we automatically try the next model in the list: `gemini-2.0-flash` → `gemini-2.5-flash-lite` → `gemini-1.5-flash-8b`. If all models fail, we return a graceful error message to the user rather than crashing.

**Q26. How does NewsAPI verification work?**
> We extract the 6 most meaningful keywords from the news text (excluding common stop words), query NewsAPI restricted to trusted domains (BBC, Reuters, NDTV, The Hindu, Hindustan Times, etc.), and check how many relevant articles exist. More articles from trusted sources = higher credibility. We also compute an average source credibility score using our pre-defined domain weight map.

---

### 🔵 CATEGORY 7: Frontend

**Q27. Why Vanilla JavaScript and not React/Vue?**
> For a project of this scope, Vanilla JS is sufficient and avoids the overhead of a JavaScript framework. It keeps the frontend lightweight, fast to load, and easier to understand and demonstrate. No build tools or compilation steps are needed.

**Q28. What is the Guest Analysis Limit and how is it enforced?**
> Guest users (not logged in) can only analyze 3 news articles for free. Each analysis ID is stored in `localStorage` (browser-side storage). When the user submits an analysis, we check if `guestSearchCount >= 3` — if so, we show a signup modal instead of calling the API. This is enforced in the frontend JavaScript.

**Q29. What is the History page? What does it show?**
> The History page shows all past analyses for authenticated users, pulled from the MySQL database. For guest users, it fetches records by the IDs stored in localStorage. It also shows an analytics dashboard with: total checks, fake count, real count, and average credibility score, along with a paginated table of past results.

---

### 🔵 CATEGORY 8: Advanced / Research Level

**Q30. What are the limitations of your current system?**
> 1. The ML model is only as good as its training dataset — if the dataset has bias, predictions will be biased.
> 2. Short headlines with no context are hard to classify accurately.
> 3. Non-English language news is not supported yet.
> 4. NewsAPI has rate limits on the free tier.
> 5. The ML model uses a relatively simple algorithm — deep learning (BERT, LSTM) could improve accuracy.

**Q31. How would you improve the ML model?**
> Instead of Logistic Regression + TF-IDF, we could use **BERT (Bidirectional Encoder Representations from Transformers)** — a deep learning model pre-trained on massive text corpora. BERT understands context and word relationships far better than bag-of-words approaches. We could also try **LSTM (Long Short-Term Memory)** networks for sequential text understanding.

**Q32. What is the difference between Supervised and Unsupervised learning? Which did you use?**
> **Supervised Learning**: The training data has labeled outputs (our dataset has `label: Fake/Real`). The model learns the mapping from input to output. We used this — Logistic Regression with labeled news data.
> **Unsupervised Learning**: No labeled data. The model finds patterns on its own (e.g., clustering, dimensionality reduction).

**Q33. What is overfitting and how do you prevent it?**
> Overfitting occurs when a model learns the training data too well — including its noise — and performs poorly on unseen data. Prevention methods include: train/test split (we use 80/20), regularization (Logistic Regression uses L2 regularization by default), limiting model complexity, and using cross-validation.

**Q34. What is the credibility score formula? Justify the weights.**
> `Score = AI_confidence(50%) + source_score(30%) + language_score(20%)`
> - AI confidence (50%): The LLM has the most contextual understanding, so it gets the highest weight.
> - Source score (30%): Real-time news source verification is highly reliable but can miss niche topics.
> - Language score (20%): Clickbait detection is a strong signal but not the most important factor.

**Q35. What is Node-Cron? What do you use it for?**
> Node-Cron is a task scheduler for Node.js, similar to Unix cron jobs. We schedule a job to run every night at midnight (`0 0 * * *`) that automatically deletes guest-analyzed news records older than 7 days from the database — preventing unbounded database growth.

**Q36. What is the difference between authentication and authorization?**
> **Authentication**: Verifying WHO you are (login — Google OAuth + JWT verify identity).
> **Authorization**: Verifying WHAT you can do (our `authenticateToken` middleware checks if the JWT is valid before allowing access to `/api/history`).

**Q37. What is a Microservices Architecture? Does your project follow it?**
> Microservices architecture breaks an application into small, independently deployable services, each doing one specific job. Our project partially follows this — the ML service (Flask on port 5001) is a separate microservice from the main backend (Express on port 5000). They communicate via HTTP REST calls.

**Q38. What is XSS and how did you protect against it?**
> XSS (Cross-Site Scripting) is an attack where malicious JavaScript is injected into a webpage to steal data. We protect against it by: (1) using HTTP-only cookies for JWT (JS cannot access them), (2) using parameterized DB queries to prevent script injection into our database, and (3) not using `innerHTML` with raw user content in our frontend.

---

### 🔵 CATEGORY 9: Future Scope

**Q39. What are the future enhancements planned?**
> Short-term: Advanced analytics dashboard with charts, PDF export of results, image/deepfake detection, API rate limiting.
> Medium-term: Browser extension for quick verification on any website, mobile app, support for non-English languages (Hindi, Marathi), community voting system.
> Long-term: Public API for third-party developers, BERT/Transformer-based ML model, blockchain-based immutable verification logs.

**Q40. Can your system detect audio/video fake news (deepfakes)?**
> Not currently — our system is text-only. To detect deepfakes (manipulated video/audio), we would need computer vision algorithms like CNNs trained on deepfake datasets, or specialized deepfake detection APIs. This is planned as a future enhancement.

---

## 🗣️ 10. How to Present (Tips for Viva)

> [!TIP]
> Follow this order when presenting to the viva examiner:

1. **Start with the problem** — "Fake news is a serious societal problem..."
2. **State your solution** — "We built VerifiAI, a 3-layer AI verification system..."
3. **Draw the architecture** on the board (3-tier: Frontend → Backend → ML/AI/DB)
4. **Walk through the workflow** step by step with the formula
5. **Explain the ML algorithm** — Logistic Regression + TF-IDF (they WILL ask this)
6. **Show the database schema** — tables, foreign keys, indexes
7. **Mention security** — OAuth, JWT, HTTP-only cookies
8. **End with future scope** — shows you understand the limitations

---

## 📊 11. Quick Formula Reference Card

```
Credibility Score = (conf × 0.5) + (src × 0.3) + (lang × 0.2)  × 100

TF-IDF(w, d) = TF(w,d) × log(N / df(w))

Sigmoid: σ(z) = 1 / (1 + e^(-z))

F1-Score = 2 × (Precision × Recall) / (Precision + Recall)

JWT = Base64(header) + "." + Base64(payload) + "." + HMAC_SHA256(secret)
```

---

*Document Version: 1.0 | Project: VerifiAI — Fake News Detection System | MSc CS Viva Preparation*
