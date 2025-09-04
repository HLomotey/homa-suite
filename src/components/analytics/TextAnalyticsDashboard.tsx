/**
 * Text Analytics Dashboard
 * Comprehensive text analysis with sentiment and word cloud visualization
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, BarChart3, Cloud, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { performCompleteAnalysis, AnalyticsResult, checkAnalyticsHealth } from '../../hooks/analytics/text-analytics-api';

interface TextAnalyticsDashboardProps {
  texts?: string[];
  onAnalysisComplete?: (result: AnalyticsResult) => void;
}

export function TextAnalyticsDashboard({ 
  texts: initialTexts = [], 
  onAnalysisComplete 
}: TextAnalyticsDashboardProps) {
  const [texts, setTexts] = useState<string[]>(initialTexts);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);

  // Check service health on mount
  useEffect(() => {
    checkAnalyticsHealth().then(setServiceAvailable);
  }, []);

  const handleAddText = () => {
    if (textInput.trim()) {
      setTexts(prev => [...prev, textInput.trim()]);
      setTextInput('');
    }
  };

  const handleRemoveText = (index: number) => {
    setTexts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (texts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const analysisResult = await performCompleteAnalysis(texts);
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

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
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (serviceAvailable === false) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-yellow-600">
              <Cloud className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Analytics Service Unavailable</h3>
              <p className="text-sm text-muted-foreground">
                The text analytics service is not running. Please start the Python microservice.
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
              <p><strong>To start the service:</strong></p>
              <p>1. Navigate to the python-analytics directory</p>
              <p>2. Run: <code>pip install -r requirements.txt</code></p>
              <p>3. Run: <code>python main.py</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Text Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Analyze sentiment patterns and generate insights from text data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add text for analysis..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={2}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddText();
                  }
                }}
              />
              <Button onClick={handleAddText} disabled={!textInput.trim()}>
                Add Text
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter to add text quickly
            </p>
          </div>

          {texts.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Texts for Analysis ({texts.length})</h4>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze All'
                  )}
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {texts.map((text, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-gray-50 rounded-md text-sm"
                  >
                    <span className="flex-1 line-clamp-2">{text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveText(index)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="wordcloud">Word Cloud</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.total_texts}</div>
                    <div className="text-sm text-muted-foreground">Total Texts</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {result.average_sentiment > 0 ? '+' : ''}{result.average_sentiment.toFixed(3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Sentiment</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.most_common_words.length}</div>
                    <div className="text-sm text-muted-foreground">Key Words</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Most Common Words</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {result.most_common_words.slice(0, 12).map((word, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{word.word}</span>
                      <Badge variant="secondary">{word.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(result.sentiment_distribution).map(([sentiment, count]) => (
                  <div key={sentiment} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(sentiment)}
                        <span className="capitalize font-medium">{sentiment}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{count} texts</span>
                        <Badge className={getSentimentColor(sentiment)}>
                          {((count / result.total_texts) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(count / result.total_texts) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wordcloud" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Word Cloud Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={`data:image/png;base64,${result.word_cloud_base64}`}
                    alt="Word Cloud"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
