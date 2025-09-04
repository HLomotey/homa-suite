/**
 * Text Analytics API integration
 * Connects to Python microservice for sentiment analysis and word clouds
 */

const ANALYTICS_API_BASE = process.env.REACT_APP_ANALYTICS_API_URL || 'http://localhost:8001';

export interface SentimentResult {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  scores: {
    compound: number;
    pos: number;
    neu: number;
    neg: number;
  };
  polarity: number;
  subjectivity: number;
}

export interface WordCloudConfig {
  width?: number;
  height?: number;
  background_color?: string;
  max_words?: number;
  colormap?: string;
}

export interface AnalyticsResult {
  sentiment_distribution: Record<string, number>;
  average_sentiment: number;
  total_texts: number;
  most_common_words: Array<{ word: string; count: number }>;
  word_cloud_base64: string;
}

/**
 * Analyze sentiment of a single text
 */
export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE}/analyze/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

/**
 * Analyze sentiment of multiple texts
 */
export const analyzeBulkSentiment = async (texts: string[]): Promise<SentimentResult[]> => {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE}/analyze/sentiment/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing bulk sentiment:', error);
    throw error;
  }
};

/**
 * Generate word cloud from text
 */
export const generateWordCloud = async (
  text: string,
  config?: WordCloudConfig
): Promise<{ word_cloud_base64: string; format: string; timestamp: string }> => {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE}/generate/wordcloud`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, config }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating word cloud:', error);
    throw error;
  }
};

/**
 * Generate word cloud from multiple texts
 */
export const generateBulkWordCloud = async (
  texts: string[],
  config?: WordCloudConfig
): Promise<{ word_cloud_base64: string; format: string; total_texts: number; timestamp: string }> => {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE}/generate/wordcloud/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts, config }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating bulk word cloud:', error);
    throw error;
  }
};

/**
 * Perform complete text analysis
 */
export const performCompleteAnalysis = async (texts: string[]): Promise<AnalyticsResult> => {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE}/analyze/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error performing complete analysis:', error);
    throw error;
  }
};

/**
 * Check if analytics service is available
 */
export const checkAnalyticsHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${ANALYTICS_API_BASE}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Analytics service unavailable:', error);
    return false;
  }
};
