/**
 * Complaint Analytics Component
 * Integrates sentiment analysis with complaint management
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Brain, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { SentimentAnalyzer } from '../analytics/SentimentAnalyzer';
import { TextAnalyticsDashboard } from '../analytics/TextAnalyticsDashboard';
import { analyzeSentiment, SentimentResult } from '../../hooks/analytics/text-analytics-api';

interface ComplaintAnalyticsProps {
  complaints: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
  }>;
  onAnalysisComplete?: (results: SentimentResult[]) => void;
}

export function ComplaintAnalytics({ complaints, onAnalysisComplete }: ComplaintAnalyticsProps) {
  const [sentimentResults, setSentimentResults] = useState<SentimentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  const analyzeAllComplaints = async () => {
    if (complaints.length === 0) return;

    setLoading(true);
    try {
      const results: SentimentResult[] = [];
      
      for (const complaint of complaints) {
        const text = `${complaint.title} ${complaint.description}`;
        const result = await analyzeSentiment(text);
        results.push({
          ...result,
          text: complaint.id // Store complaint ID for reference
        });
      }
      
      setSentimentResults(results);
      onAnalysisComplete?.(results);
    } catch (error) {
      console.error('Error analyzing complaints:', error);
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
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getComplaintTexts = () => {
    return complaints.map(c => `${c.title} ${c.description}`);
  };

  const getSelectedComplaintText = () => {
    if (!selectedComplaint) return '';
    const complaint = complaints.find(c => c.id === selectedComplaint);
    return complaint ? `${complaint.title} ${complaint.description}` : '';
  };

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const urgentComplaints = sentimentResults
    .map((result, index) => ({
      ...result,
      complaint: complaints[index],
      urgencyScore: (result.sentiment === 'negative' ? result.confidence * 2 : result.confidence) + 
                   (priorityOrder[complaints[index]?.priority as keyof typeof priorityOrder] || 1)
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Complaint Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Analyze complaint sentiment to prioritize responses and identify patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {complaints.length} complaints available for analysis
            </div>
            <Button 
              onClick={analyzeAllComplaints} 
              disabled={loading || complaints.length === 0}
            >
              {loading ? 'Analyzing...' : 'Analyze All Complaints'}
            </Button>
          </div>

          {sentimentResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {sentimentResults.filter(r => r.sentiment === 'negative').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Negative Sentiment</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {sentimentResults.filter(r => r.sentiment === 'neutral').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Neutral Sentiment</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {sentimentResults.filter(r => r.sentiment === 'positive').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Positive Sentiment</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {sentimentResults.length > 0 && (
        <Tabs defaultValue="urgent" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="urgent">Urgent Complaints</TabsTrigger>
            <TabsTrigger value="individual">Individual Analysis</TabsTrigger>
            <TabsTrigger value="overview">Complete Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="urgent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High Priority Complaints (by Sentiment + Priority)</CardTitle>
                <CardDescription>
                  Complaints ranked by negative sentiment and priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgentComplaints.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSentimentIcon(item.sentiment)}
                          <span className="font-medium">{item.complaint.title}</span>
                          <Badge variant="outline" className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                            {item.sentiment}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.complaint.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.complaint.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Confidence: {(item.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Urgency: {item.urgencyScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Individual Complaint Analysis</CardTitle>
                <CardDescription>
                  Select a complaint to analyze its sentiment in detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedComplaint || ''}
                    onChange={(e) => setSelectedComplaint(e.target.value)}
                    title="Select complaint for analysis"
                    aria-label="Select complaint for sentiment analysis"
                  >
                    <option value="">Select a complaint to analyze...</option>
                    {complaints.map((complaint) => (
                      <option key={complaint.id} value={complaint.id}>
                        {complaint.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedComplaint && (
                  <SentimentAnalyzer
                    initialText={getSelectedComplaintText()}
                    autoAnalyze={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <TextAnalyticsDashboard 
              texts={getComplaintTexts()}
              onAnalysisComplete={(result) => {
                console.log('Complete complaint analysis:', result);
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
