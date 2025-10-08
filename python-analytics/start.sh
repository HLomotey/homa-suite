#!/bin/bash

# HOMA Suite Text Analytics Service Startup Script

echo "🚀 Starting HOMA Suite Text Analytics Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if we're in a virtual environment, if not create one
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "📦 Setting up virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
else
    echo "✅ Virtual environment already active"
fi

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Download NLTK data
echo "🔤 Downloading NLTK data..."
python -c "
import nltk
try:
    nltk.data.find('tokenizers/punkt')
    print('✅ NLTK punkt already downloaded')
except LookupError:
    print('📥 Downloading NLTK punkt...')
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
    print('✅ NLTK stopwords already downloaded')
except LookupError:
    print('📥 Downloading NLTK stopwords...')
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/vader_lexicon')
    print('✅ NLTK vader_lexicon already downloaded')
except LookupError:
    print('📥 Downloading NLTK vader_lexicon...')
    nltk.download('vader_lexicon')
"

echo "🌟 Starting the analytics service on http://localhost:8001"
echo "📖 API Documentation will be available at http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the service
python main.py
