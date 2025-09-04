# HOMA Suite Text Analytics Service

A Python microservice providing sentiment analysis and word cloud generation capabilities for the HOMA Suite property management system.

## Features

- **Sentiment Analysis**: Analyze text sentiment using NLTK VADER and TextBlob
- **Word Cloud Generation**: Create visual word clouds from text data
- **Bulk Processing**: Handle multiple texts simultaneously
- **Complete Analytics**: Combined sentiment and word cloud analysis
- **REST API**: FastAPI-based service with automatic documentation

## API Endpoints

### Health Check
- `GET /` - Service health check

### Sentiment Analysis
- `POST /analyze/sentiment` - Analyze single text sentiment
- `POST /analyze/sentiment/bulk` - Analyze multiple texts

### Word Cloud Generation
- `POST /generate/wordcloud` - Generate word cloud from single text
- `POST /generate/wordcloud/bulk` - Generate word cloud from multiple texts

### Complete Analysis
- `POST /analyze/complete` - Full analysis with sentiment distribution and word cloud

## Installation

### Local Development

1. Create virtual environment:
```bash
cd python-analytics
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python main.py
```

The service will be available at `http://localhost:8001`

### Docker Deployment

1. Build the image:
```bash
docker build -t homa-analytics .
```

2. Run the container:
```bash
docker run -p 8001:8001 homa-analytics
```

## API Documentation

Once running, visit:
- Interactive docs: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Usage Examples

### Sentiment Analysis
```python
import requests

response = requests.post("http://localhost:8001/analyze/sentiment", 
    json={"text": "I love this property management system!"})
print(response.json())
```

### Word Cloud Generation
```python
response = requests.post("http://localhost:8001/generate/wordcloud", 
    json={
        "text": "property management tenant satisfaction maintenance",
        "config": {
            "width": 800,
            "height": 400,
            "background_color": "white"
        }
    })
```

## Integration with HOMA Suite

This service is designed to integrate with:
- **Complaints Module**: Analyze complaint sentiment
- **Feedback Systems**: Process tenant/staff feedback
- **Communication Analysis**: Analyze internal communications
- **Reporting**: Generate insights from text data

## Configuration

Environment variables:
- `PORT`: Service port (default: 8001)
- `HOST`: Service host (default: 0.0.0.0)

## Dependencies

- FastAPI: Web framework
- NLTK: Natural language processing
- TextBlob: Text processing
- WordCloud: Word cloud generation
- Matplotlib: Plotting and visualization
