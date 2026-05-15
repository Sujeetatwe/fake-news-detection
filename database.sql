-- Create Database
CREATE DATABASE IF NOT EXISTS fake_news_db;
USE fake_news_db;

-- Create `news_checks` Table
CREATE TABLE IF NOT EXISTS news_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_text TEXT NOT NULL,
    prediction ENUM('Fake', 'Real') DEFAULT NULL,
    confidence FLOAT DEFAULT NULL,
    api_verification VARCHAR(255) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
