"""
Text Analytics Microservice for HOMA Suite
Provides sentiment analysis and word cloud generation capabilities
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from textblob import TextBlob
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import io
import base64
from collections import Counter
import re
import os
from datetime import datetime

# Simple stopwords list (avoiding NLTK dependency issues)
STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
    'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
    'just', 'don', 'should', 'now'
}

app = FastAPI(
    title="HOMA Suite Text Analytics API",
    description="Sentiment analysis and word cloud generation for property management data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple sentiment analysis using TextBlob only

# Pydantic models
class TextInput(BaseModel):
    text: str
    language: Optional[str] = "en"

class BulkTextInput(BaseModel):
    texts: List[str]
    language: Optional[str] = "en"

class SentimentResult(BaseModel):
    text: str
    sentiment: str  # positive, negative, neutral
    confidence: float
    scores: Dict[str, float]  # compound, pos, neu, neg
    polarity: float  # TextBlob polarity (-1 to 1)
    subjectivity: float  # TextBlob subjectivity (0 to 1)

class WordCloudConfig(BaseModel):
    width: Optional[int] = 800
    height: Optional[int] = 400
    background_color: Optional[str] = "white"
    max_words: Optional[int] = 100
    colormap: Optional[str] = "viridis"

class WordCloudInput(BaseModel):
    text: str
    config: Optional[WordCloudConfig] = WordCloudConfig()

class BulkWordCloudInput(BaseModel):
    texts: List[str]
    config: Optional[WordCloudConfig] = WordCloudConfig()

class AnalyticsResult(BaseModel):
    sentiment_distribution: Dict[str, int]
    average_sentiment: float
    total_texts: int
    most_common_words: List[Dict[str, Any]]
    word_cloud_base64: str

def clean_text(text: str) -> str:
    """Clean and preprocess text for analysis"""
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    # Remove user mentions and hashtags
    text = re.sub(r'@\w+|#\w+', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def analyze_sentiment(text: str) -> SentimentResult:
    """Analyze sentiment of a single text using TextBlob"""
    cleaned_text = clean_text(text)
    
    # TextBlob sentiment analysis
    blob = TextBlob(cleaned_text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    # Determine overall sentiment based on polarity
    if polarity >= 0.1:
        sentiment = "positive"
    elif polarity <= -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    # Confidence is the absolute value of polarity
    confidence = abs(polarity)
    
    # Create VADER-like scores for compatibility
    pos_score = max(0, polarity)
    neg_score = max(0, -polarity)
    neu_score = 1 - abs(polarity)
    
    # Normalize scores
    total = pos_score + neg_score + neu_score
    if total > 0:
        pos_score /= total
        neg_score /= total
        neu_score /= total
    
    vader_scores = {
        'compound': polarity,
        'pos': pos_score,
        'neu': neu_score,
        'neg': neg_score
    }
    
    return SentimentResult(
        text=text,
        sentiment=sentiment,
        confidence=confidence,
        scores=vader_scores,
        polarity=polarity,
        subjectivity=subjectivity
    )

def generate_word_cloud(text: str, config: WordCloudConfig) -> str:
    """Generate word cloud and return as base64 encoded image"""
    try:
        cleaned_text = clean_text(text)
        
        # Use our simple stopwords set
        stop_words = STOPWORDS
        
        # Create WordCloud
        wordcloud = WordCloud(
            width=config.width,
            height=config.height,
            background_color=config.background_color,
            max_words=config.max_words,
            stopwords=stop_words,
            colormap=config.colormap,
            relative_scaling=0.5,
            random_state=42
        ).generate(cleaned_text)
        
        # Create matplotlib figure
        plt.figure(figsize=(config.width/100, config.height/100))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        
        # Save to bytes
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
        img_buffer.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        plt.close()  # Clean up
        
        return img_base64
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating word cloud: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "HOMA Suite Text Analytics API",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze/sentiment", response_model=SentimentResult)
async def analyze_text_sentiment(input_data: TextInput):
    """Analyze sentiment of a single text"""
    try:
        result = analyze_sentiment(input_data.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sentiment: {str(e)}")

@app.post("/analyze/sentiment/bulk", response_model=List[SentimentResult])
async def analyze_bulk_sentiment(input_data: BulkTextInput):
    """Analyze sentiment of multiple texts"""
    try:
        results = []
        for text in input_data.texts:
            result = analyze_sentiment(text)
            results.append(result)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing bulk sentiment: {str(e)}")

@app.post("/generate/wordcloud")
async def create_word_cloud(input_data: WordCloudInput):
    """Generate word cloud from text"""
    try:
        img_base64 = generate_word_cloud(input_data.text, input_data.config)
        return {
            "word_cloud_base64": img_base64,
            "format": "png",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating word cloud: {str(e)}")

@app.post("/generate/wordcloud/bulk")
async def create_bulk_word_cloud(input_data: BulkWordCloudInput):
    """Generate word cloud from multiple texts combined"""
    try:
        # Combine all texts
        combined_text = " ".join(input_data.texts)
        img_base64 = generate_word_cloud(combined_text, input_data.config)
        
        return {
            "word_cloud_base64": img_base64,
            "format": "png",
            "total_texts": len(input_data.texts),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating bulk word cloud: {str(e)}")

@app.post("/analyze/complete", response_model=AnalyticsResult)
async def complete_text_analysis(input_data: BulkTextInput):
    """Perform complete text analysis including sentiment and word cloud"""
    try:
        # Analyze sentiment for all texts
        sentiment_results = []
        for text in input_data.texts:
            result = analyze_sentiment(text)
            sentiment_results.append(result)
        
        # Calculate sentiment distribution
        sentiment_counts = Counter([r.sentiment for r in sentiment_results])
        sentiment_distribution = dict(sentiment_counts)
        
        # Calculate average sentiment score
        avg_sentiment = sum([r.scores['compound'] for r in sentiment_results]) / len(sentiment_results)
        
        # Get most common words
        combined_text = " ".join([clean_text(text) for text in input_data.texts])
        words = combined_text.lower().split()
        filtered_words = [word for word in words if word not in STOPWORDS and len(word) > 2]
        most_common = Counter(filtered_words).most_common(20)
        most_common_words = [{"word": word, "count": count} for word, count in most_common]
        
        # Generate word cloud
        config = WordCloudConfig()
        img_base64 = generate_word_cloud(combined_text, config)
        
        return AnalyticsResult(
            sentiment_distribution=sentiment_distribution,
            average_sentiment=avg_sentiment,
            total_texts=len(input_data.texts),
            most_common_words=most_common_words,
            word_cloud_base64=img_base64
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in complete analysis: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
