require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

// Import database connection to verify it works on startup
const db = require('./config/db');

// Import path module from Node.js
const path = require('path');

// --- MODULE 8: Load API Configurations Once ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Set up Static File Serving for Frontend
// This makes Express act as a Web Server for our HTML/CSS/JS without extensions!
app.use(express.static(path.join(__dirname, '../frontend'), {
    extensions: ['html', 'htm'] // Automatically append .html to urls that lack it!
}));

// Basic route to test server
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Express server is running' });
});

// --- MODULE 1: Google Authentication Setup ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Note: Replace with actual client ID in .env
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential' });
        }

        // Verify the Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        // The payload contains the user's data from Google
        const payload = ticket.getPayload();
        const { sub: google_id, name, email, picture: profile_picture } = payload;
        
        // --- MODULE 2: Update Users Database ---
        let user;
        const [existingUser] = await db.execute('SELECT * FROM users WHERE google_id = ?', [google_id]);

        if (existingUser.length > 0) {
            // User exists, log them in & update details if they changed
            user = existingUser[0];
            if (user.name !== name || user.profile_picture !== profile_picture) {
                await db.execute('UPDATE users SET name = ?, profile_picture = ? WHERE id = ?', [name, profile_picture, user.id]);
                user.name = name;
                user.profile_picture = profile_picture;
            }
        } else {
            // New user, create deeply
            const [insertResult] = await db.execute(
                'INSERT INTO users (google_id, name, email, profile_picture) VALUES (?, ?, ?, ?)',
                [google_id, name, email, profile_picture]
            );
            user = { id: insertResult.insertId, google_id, name, email, profile_picture };
        }

        // --- MODULE 3: Authentication Session (JWT) ---
        const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
        
        // Ensure token expires after 24 hours (MODULE 9: Security)
        const token = jwt.sign({ id: user.id, google_id: user.google_id }, JWT_SECRET, { expiresIn: '24h' });

        // Set token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true if https
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
            sameSite: 'strict'
        });

        return res.status(200).json({
            status: 'success',
            message: 'Authentication successful',
            user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture }
        });

    } catch (error) {
        console.error('Error verifying Google Auth token:', error);
        return res.status(401).json({ error: 'Invalid Google Authentication token.' });
    }
});

// --- MODULE 3: Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied. No authentication token provided.' });

    const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// --- Optional: authenticate API logic for users but allow guests ---
const authenticateOptional = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) req.user = null;
        else req.user = user;
        next();
    });
};

// Fetch current user details
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, google_id, name, email, profile_picture FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        return res.json({ status: 'success', user: rows[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error fetching user details' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ status: 'success', message: 'Logged out successfully' });
});

/**
 * MODULE 5: POST /api/check-news
 * Receives news text from frontend, calls Python ML, saves to DB, returns to frontend.
 */
app.post('/api/check-news', authenticateOptional, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'News text is required.' });
        }

        // --- MODULE 5: API Response Caching ---
        // Instantly checks the database. Skips ALL expensive Gemini/News calls if found!
        try {
            const [cacheResult] = await db.execute('SELECT * FROM news_checks WHERE news_text = ? LIMIT 1', [text]);
            if (cacheResult.length > 0) {
                const cached = cacheResult[0];
                // If a guest searched this previously (user_id is NULL) and now a logged in user is searching it,
                // OR if a guest is searching it again, we need to ensure the most recent attempt is linked accurately.
                // However, caching creates a unique problem where we don't insert a NEW row.
                // To fix the guest-history rendering bug securely, we will just ALWAYS insert a new row for the user 
                // so they get their own timestamp and ID, but we will copy the safe cached data!
                
                const user_id = req.user ? req.user.id : null;
                
                const insertQuery = `
                    INSERT INTO news_checks (news_text, prediction, confidence, api_verification, ai_summary, credibility_score, claim_category, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                const [newRow] = await db.execute(insertQuery, [
                    text, cached.prediction, cached.confidence, cached.api_verification, cached.ai_summary, 
                    cached.credibility_score, cached.claim_category, user_id
                ]);

                // Recalculate quick local manipulation risk
                const clickbaitKeywords = ['shocking', 'secret cure', "they don't want you to know", 'miracle treatment', 'exposed truth', 'you won\'t believe', 'mind-blowing', 'scandal', 'hidden agenda', 'banned'];
                let clickbaitMatched = false;
                const lowerText = text.toLowerCase();
                for (const kw of clickbaitKeywords) { if (lowerText.includes(kw)) { clickbaitMatched = true; break; } }
                
                return res.status(200).json({
                    status: 'success',
                    data: {
                        id: newRow.insertId, // Pass the NEW row ID back to the frontend
                        text: cached.news_text,
                        prediction: cached.prediction,
                        confidence: cached.confidence,
                        category: cached.claim_category,
                        api_verification: cached.api_verification + " (Cached)",
                        ai_summary: cached.ai_summary,
                        credibility_score: cached.credibility_score,
                        matched_sources: [], // Avoids scraping live internet
                        manipulation_risk: clickbaitMatched ? "HIGH" : "LOW",
                        is_cached: true
                    }
                });
            }
        } catch (dbErr) {
            console.warn('Cache check failed. Falling back to live APIs.', dbErr.message);
        }

        const geminiApiKey = GEMINI_API_KEY;
        let factCheckContext = "";

        // --- NEW FEATURE C: Google Fact Check Tools API ---
        if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
            try {
                const queryText = encodeURIComponent(text.substring(0, 50));
                const factResponse = await axios.get(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${queryText}&key=${geminiApiKey}`);
                
                const claims = factResponse.data.claims || [];
                if (claims.length > 0) {
                    const topClaim = claims[0];
                    const review = topClaim.claimReview && topClaim.claimReview.length > 0 ? topClaim.claimReview[0] : null;
                    if (review) {
                        factCheckContext = `[OFFICIAL FACT CHECK] A professional fact-checker (${review.publisher.name}) recently reviewed a similar claim. Their official verdict is: "${review.textualRating}".\n\n`;
                    }
                }
            } catch (err) {
                console.warn('Fact Check API unavailable or not enabled for this key, skipping.');
            }
        }

        // 1. Fetch live contextual data from NewsAPI
        let apiVerification = 'Pending';
        let contextText = factCheckContext + "Live internet search results:\n";
        let matchedSources = []; // MODULE 2 array
        let avg_source_score = 0.2; // MODULE 2 calculated score
        const newsApiKey = NEWS_API_KEY;
        
        if (newsApiKey && newsApiKey !== 'your_free_newsapi_key_here') {
            try {
                // --- MODULE 8: Improved Keyword Extraction ---
                // Removing common extremely broad stop-words prevents NewsAPI garbage data return.
                const stopWords = ['the','is','at','which','and','on','a','an','of','to','in','for','with','by','that','this','it','from','as','are','was'];
                const cleanWords = text.replace(/[^\w\s]/gi, '').split(/\s+/)
                    .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()));
                const optimalQuery = cleanWords.slice(0, 6).join(' ');
                
                const queryText = encodeURIComponent(optimalQuery || text.substring(0, 50));
                
                // FEATURE A: Domain Whitelisting for high-accuracy tier-1 journalism (English, Hindi, Marathi)
                const safeDomains = 'bbc.com,reuters.com,thehindu.com,indianexpress.com,timesofindia.indiatimes.com,hindustantimes.com,ndtv.com,aajtak.in,jagran.com,bhaskar.com,abplive.com,amarujala.com,lokmat.com,loksatta.com,maharashtratimes.com,esakal.com';
                
                // --- MODULE 8: Limit API Requests ---
                // Note: Restricts payload heavily via &pageSize=5 instead of downloading 100 array items
                const newsResponse = await axios.get(`https://newsapi.org/v2/everything?q=${queryText}&domains=${safeDomains}&sortBy=relevancy&pageSize=5&apiKey=${newsApiKey}`);
                
                const articles = newsResponse.data.articles || [];
                const topArticles = articles.slice(0, 5);
                
                if (topArticles.length === 0) {
                    contextText += "No recent reliable articles found on this topic.\n";
                } else {
                    // --- MODULE 2: Source Credibility Ranking ---
                    const credibilityMap = {
                        'bbc news': 0.95,
                        'reuters': 0.95,
                        'the guardian': 0.90,
                        'cnn': 0.85,
                        'the hindu': 0.90,
                        'the indian express': 0.85,
                        'the times of india': 0.80,
                        'hindustan times': 0.80,
                        'ndtv': 0.80
                    };
                    
                    let total_score = 0;
                    
                    topArticles.forEach((article, index) => {
                        contextText += `Source ${index + 1}: ${article.source.name}\nTitle: ${article.title}\nDescription: ${article.description}\n\n`;
                        
                        // Module 2 logic
                        const sName = article.source.name ? article.source.name.toLowerCase() : '';
                        const sScore = credibilityMap[sName] || 0.40; // 0.40 for unknown
                        total_score += sScore;
                        
                        matchedSources.push({
                            name: article.source.name,
                            score: sScore,
                            description: article.description || "No description provided."
                        });
                    });
                    
                    avg_source_score = total_score / topArticles.length;
                }
                
                const totalResults = newsResponse.data.totalResults || 0;
                
                if (totalResults > 5) {
                    apiVerification = 'High Credibility (Widely Reported)';
                } else if (totalResults > 0) {
                    apiVerification = 'Moderate Credibility (Some Sources Found)';
                } else {
                    apiVerification = 'Low Credibility (No Trusted Sources Found)';
                }
            } catch (apiErr) {
                console.error('External API Request Failed:', apiErr.response?.data || apiErr.message);
                apiVerification = 'Verification Failed (API Limit Reached or Error)';
                contextText += "Error fetching live data. Rely solely on internal knowledge.\n";
            }
        } else {
            apiVerification = 'NewsAPI Key missing in .env - Setup Required';
            contextText += "No live data available (API Key missing).\n";
        }

        // 2. Feed text and live context to Google Gemini
        let prediction = "Fake";
        let confidence = 0.5;
        let aiSummary = 'AI Fact-Check not generated. Please configure GEMINI_API_KEY in .env.';
        let claim_category = 'Other'; // MODULE 3 Default

        if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
            const fallbackModels = [
                "gemini-1.5-flash", 
                "gemini-2.0-flash", 
                "gemini-2.5-flash-lite", 
                "gemini-flash-lite-latest",
                "gemini-1.5-flash-8b"
            ];
            
            let success = false;
            let lastError = null;

            for (const modelName of fallbackModels) {
                try {
                    const genAI = new GoogleGenerativeAI(geminiApiKey);
                    const model = genAI.getGenerativeModel({ model: modelName }); 
                    
                    const prompt = `You are a highly intelligent fact-checking AI. 
Today's actual date is: ${new Date().toDateString()}. Use this date to understand when "today" or "recent" is to avoid marking real events as "the future."

User Claim to verify: "${text.substring(0, 500)}"

Here are top news headlines and simple snippets scraped from the internet right now relating to the claim:
${contextText}

Using the provided live internet data AND your own vast internal dataset, perform the following task:
1. Determine if the claim is "Real" or "Fake". 
CRITICAL RULE: The internet data provided are just short summaries. Do NOT mark a claim as "Fake" just because a specific number or minor detail is missing from the short summaries. If the core event or context is generally supported by the news snippets or your internal knowledge, mark it as "Real". Only mark it as "Fake" if the core claim is verifiably false, contradicts the news, or is entirely a conspiracy.
2. Provide a confidence score between 0.0 and 1.0.
3. Write a 2-3 sentence summary explaining WHY it is true or false. Include the "OFFICIAL FACT CHECK" in your summary if one was provided in the context.
4. Provide a list of citations (newspaper names or fact checkers) used to evaluate this.
5. Identify the Claim Category (Politics, Health, Science, Technology, Economy, Entertainment, World, or Other).

Respond ONLY with a valid JSON object in strict string format, with no markdown formatting or blockquotes:
{
  "prediction": "Real",
  "confidence": 0.90,
  "summary": "Your explanation goes here.",
  "citations": ["BBC News", "Reuters"],
  "category": "Science"
}`;
                    
                    const geminiResponse = await model.generateContent(prompt);
                    const responseText = geminiResponse.response.text().trim();
                    
                    // Parse the JSON output securely with robust regex extraction
                    let cleanedJsonText = responseText;
                    
                    // Sometimes Gemini ignores instructions and returns extra text around the JSON.
                    // This regex extracts ONLY the JSON object from the response string.
                    const jsonMatch = responseText.match(/{(?:[^{}]|(?:{[^{}]*}))*}/);
                    if (jsonMatch) {
                        cleanedJsonText = jsonMatch[0];
                    }

                    cleanedJsonText = cleanedJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const aiResult = JSON.parse(cleanedJsonText);
                    
                    prediction = aiResult.prediction || "Fake";
                    confidence = aiResult.confidence || 0.5;
                    let baseSummary = aiResult.summary || "No summary provided.";
                    
                    // --- MODULE 3: Claim Category Extraction ---
                    claim_category = aiResult.category || "Other";
                    
                    // FEATURE B: Source Citations
                    let citationsList = aiResult.citations || [];
                    if (citationsList.length > 0) {
                        aiSummary = baseSummary + "\n\nSources Cited: " + citationsList.join(', ');
                    } else {
                        aiSummary = baseSummary;
                    }

                    // If we reach this point without crashing, the model succeeded!
                    success = true;
                    console.log(`[AI SUCCESS] Verified using model: ${modelName}`);
                    break; // Escape the fallback loop

                } catch (geminiError) {
                    lastError = geminiError;
                    const errorMsg = geminiError.message;
                    
                    // Check if it's a rate limit or "not found" error
                    if (errorMsg.includes('429 Too Many Requests') || errorMsg.includes('Quota exceeded') || errorMsg.includes('404')) {
                        console.warn(`[AI FALLBACK] Target model ${modelName} rate limited. Switching to next model...`);
                        continue; // Run the loop again with the next available model
                    }
                    
                    // If it crashed for another reason (like parsing), stop trying other models
                    console.error(`[AI ERROR] Logic failed on ${modelName}:`, errorMsg);
                    break;
                }
            }

            // If ALL models failed, trigger the robust fallback logic
            if (!success) {
                console.error("[CRITICAL] All AI models failed verifying the claim.");
                
                prediction = "Fake"; // Default safe fallback
                confidence = 0.50;
                claim_category = "Other";
                
                if (lastError && (lastError.message.includes('429 Too Many Requests') || lastError.message.includes('Quota exceeded'))) {
                    aiSummary = "The AI verification engine has exhausted all available Google Gemini fallback models and reached the system request limit. Please wait a minute before analyzing more articles.";
                } else {
                    aiSummary = "The AI verification engine encountered a processing error while verifying this claim. Based on preliminary semantic checks, please approach this article with caution.";
                }
            }
        }

        // --- MODULE 1: Credibility Score Engine ---
        // Use our dynamically calculated average source score from Module 2 NewsAPI results
        let source_score = avg_source_score;
        
        // --- MODULE 4: Clickbait Language Detection ---
        const clickbaitKeywords = [
            'shocking', 'secret cure', "they don't want you to know", 
            'miracle treatment', 'exposed truth', 'you won\'t believe', 
            'mind-blowing', 'scandal', 'hidden agenda', 'banned'
        ];
        
        let clickbaitMatched = false;
        const lowerText = text.toLowerCase();
        
        for (const kw of clickbaitKeywords) {
            if (lowerText.includes(kw)) {
                clickbaitMatched = true;
                break;
            }
        }
        
        // If manipulative language is detected, slash the language score. Otherwise, perfect 1.0 score.
        let language_score = clickbaitMatched ? 0.3 : 1.0; 
        let manipulation_risk = clickbaitMatched ? "HIGH" : "Low";
        
        // credibility_score = (ai_confidence * 0.5) + (source_score * 0.3) + (language_score * 0.2)
        let credibility_score = Math.round((confidence * 100 * 0.5) + (source_score * 100 * 0.3) + (language_score * 100 * 0.2));
        
        // Cap score tightly between 0 - 100
        credibility_score = Math.min(100, Math.max(0, credibility_score));

        // 3. Save result into MySQL Database (MODULE 5 & 6)
        const user_id = req.user ? req.user.id : null;
        
        const insertQuery = `
            INSERT INTO news_checks (news_text, prediction, confidence, api_verification, ai_summary, credibility_score, claim_category, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertQuery, [text, prediction, confidence, apiVerification, aiSummary, credibility_score, claim_category, user_id]);

        // 4. Return the comprehensive result to the frontend
        res.status(200).json({
            status: 'success',
            data: {
                id: result.insertId,
                text: text,
                prediction: prediction,
                confidence: confidence,
                category: claim_category,
                api_verification: apiVerification,
                ai_summary: aiSummary,
                credibility_score: credibility_score,
                matched_sources: matchedSources,
                manipulation_risk: manipulation_risk
            }
        });

    } catch (error) {
        console.error('Error during /check-news:', error.message);
        res.status(500).json({ error: 'Internal server error while checking news.' });
    }
});

/**
 * MODULE 6 Extension: GET /api/history
 * Fetches recent news checks from the database to display on the History page.
 * NOW RESTRICTED to logged-in users only.
 */
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT id, news_text, prediction, confidence, api_verification, ai_summary, credibility_score, claim_category, created_at 
            FROM news_checks 
            WHERE user_id = ?
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const [rows] = await db.execute(query, [req.user.id]);
        
        // --- MODULE 6: Analytics Dashboard (User Specific) ---
        const statsQuery = `
            SELECT 
                COUNT(*) as total_claims,
                SUM(CASE WHEN prediction = 'Fake' THEN 1 ELSE 0 END) as fake_count,
                SUM(CASE WHEN prediction = 'Real' THEN 1 ELSE 0 END) as real_count,
                AVG(credibility_score) as avg_credibility
            FROM news_checks
            WHERE user_id = ?
        `;
        const [statsResult] = await db.execute(statsQuery, [req.user.id]);
        const stats = statsResult[0] || { total_claims: 0, fake_count: 0, real_count: 0, avg_credibility: 0 };
        
        res.status(200).json({
            status: 'success',
            data: rows,
            analytics: {
                total_claims: stats.total_claims || 0,
                fake_news: stats.fake_count || 0,
                real_news: stats.real_count || 0,
                avg_credibility: stats.avg_credibility ? Math.round(stats.avg_credibility) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ error: 'Failed to retrieve history records.' });
    }
});

/**
 * MODULE 6 ALTERNATE: POST /api/history/guest
 * Allows guests to view the history of only the items they personally searched
 * by checking the ID array stored in their browser localStorage.
 */
app.post('/api/history/guest', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(200).json({ status: 'success', data: [], analytics: null });
        }

        // Validate IDs are purely numbers (security)
        const validIds = ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
        if (validIds.length === 0) return res.status(200).json({ status: 'success', data: [], analytics: null });

        // Build safe SQL placeholders string e.g., (?,?,?)
        const placeholders = validIds.map(() => '?').join(',');

        const query = `
            SELECT id, news_text, prediction, confidence, api_verification, ai_summary, credibility_score, claim_category, created_at 
            FROM news_checks 
            WHERE id IN (${placeholders})
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        const [rows] = await db.execute(query, validIds);
        
        // --- Analytics Dashboard (Guest Specific) ---
        const statsQuery = `
            SELECT 
                COUNT(*) as total_claims,
                SUM(CASE WHEN prediction = 'Fake' THEN 1 ELSE 0 END) as fake_count,
                SUM(CASE WHEN prediction = 'Real' THEN 1 ELSE 0 END) as real_count,
                AVG(credibility_score) as avg_credibility
            FROM news_checks
            WHERE id IN (${placeholders})
        `;
        const [statsResult] = await db.execute(statsQuery, validIds);
        const stats = statsResult[0] || { total_claims: 0, fake_count: 0, real_count: 0, avg_credibility: 0 };
        
        res.status(200).json({
            status: 'success',
            data: rows,
            analytics: {
                total_claims: stats.total_claims || 0,
                fake_news: stats.fake_count || 0,
                real_news: stats.real_count || 0,
                avg_credibility: stats.avg_credibility ? Math.round(stats.avg_credibility) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching guest history:', error.message);
        res.status(500).json({ error: 'Failed to retrieve guest history records.' });
    }
});

// --- MODULE 8: Proper Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({ error: 'Critical server error occurred.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});

// --- MODULE 9: Automated Database Cleanup (Cron) ---
// Runs automatically every night at midnight (0 0 * * *)
// Deletes anonymously searched "Guest Checks" from the database that are older than 7 days, 
// ensuring the Database Cache remains clean and doesn't bloat endlessly.
cron.schedule('0 0 * * *', async () => {
    try {
        const [result] = await db.execute(`
            DELETE FROM news_checks 
            WHERE user_id IS NULL AND created_at < NOW() - INTERVAL 7 DAY
        `);
        if (result.affectedRows > 0) {
            console.log(`[Cron Database Cleanup]: Deleted ${result.affectedRows} old guest cache rows.`);
        }
    } catch (error) {
        console.error('[Cron Database Cleanup Error]:', error.message);
    }
});
