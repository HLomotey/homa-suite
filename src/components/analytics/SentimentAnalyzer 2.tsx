/**
 * Sentiment Analyzer Component
 * Provides real-time sentiment analysis for text input
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { analyzeSentiment, SentimentResult } from '../../hooks/analytics/text-analytics-api';

interface SentimentAnalyzerProps {
  initialText?: string;
  onAnalysisComplete?: (result: SentimentResult) => void;
  autoAnalyze?: boolean;
}

export function SentimentAnalyzer({ 
  initialText = '', 
  onAnalysisComplete,
  autoAnalyze = false 
}: SentimentAnalyzerProps) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeSentiment(text);
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when text changes (with debounce)
  useEffect(() => {
    if (!autoAnalyze || !text.trim()) return;

    const timer = setTimeout(() => {
      handleAnalyze();
    }, 1000);

    return () => clearTimeout(timer);
  }, [text, autoAnalyze]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Sentiment Analysis
          {result && getSentimentIcon(result.sentiment)}
        </CardTitle>
        <CardDescription>
          Analyze the emotional tone and sentiment of text content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter text to analyze sentiment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {!autoAnalyze && (
          <Button 
            onClick={handleAnalyze} 
            disabled={!text.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Sentiment'
            )}
          </Button>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getSentimentColor(result.sentiment)}>
                  {result.sentiment.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Sentiment Scores</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Positive</span>
                    <span className="text-sm font-mono">
                      {(result.scores.pos * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.scores.pos * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Neutral</span>
                    <span className="text-sm font-mono">
                      {(result.scores.neu * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.scores.neu * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Negative</span>
                    <span className="text-sm font-mono">
                      {(result.scores.neg * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.scores.neg * 100} className="h-2" />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Analysis Metrics</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Compound Score</span>
                    <span className="text-sm font-mono">
                      {result.scores.compound.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Polarity</span>
                    <span className="text-sm font-mono">
                      {result.polarity.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subjectivity</span>
                    <span className="text-sm font-mono">
                      {result.subjectivity.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p><strong>Compound:</strong> Overall sentiment (-1 to +1)</p>
              <p><strong>Polarity:</strong> Objective vs subjective (-1 to +1)</p>
              <p><strong>Subjectivity:</strong> Factual vs opinion (0 to 1)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
