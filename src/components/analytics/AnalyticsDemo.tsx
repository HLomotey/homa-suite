/**
 * Analytics Demo Page
 * Showcases text analytics capabilities for property management
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Brain, MessageSquare, TrendingUp } from 'lucide-react';
import { SentimentAnalyzer } from './SentimentAnalyzer';
import { WordCloudGenerator } from './WordCloudGenerator';
import { TextAnalyticsDashboard } from './TextAnalyticsDashboard';

const SAMPLE_COMPLAINTS = [
  "The heating system in my apartment has been broken for three days. This is completely unacceptable and I demand immediate action!",
  "I love living here! The maintenance team is always quick to respond and the facilities are excellent.",
  "The noise from construction next door is really bothering me. It starts too early in the morning.",
  "Thank you so much for fixing the plumbing issue so quickly. Great service!",
  "The elevator has been out of order for a week. This is very inconvenient for elderly residents.",
  "The new gym equipment is fantastic! Really appreciate the investment in resident amenities.",
  "There's a persistent water leak in the basement that needs attention.",
  "The staff here is wonderful and always helpful. Couldn't ask for better property management.",
  "The parking situation is terrible. Not enough spaces for all residents.",
  "Just wanted to say how clean and well-maintained the common areas are. Keep up the good work!"
];

const SAMPLE_FEEDBACK = [
  "The online portal makes it so easy to submit maintenance requests and pay rent.",
  "Communication could be better. Sometimes I don't hear back about my requests for days.",
  "Love the new package delivery system! Very convenient.",
  "The property manager is always professional and addresses concerns promptly.",
  "Would like to see more social events organized for residents.",
  "The security measures make me feel very safe living here.",
  "Rent increases are getting out of hand. Need more transparency about pricing.",
  "The landscaping around the property looks beautiful this year.",
  "Internet connectivity in the building could be improved.",
  "Overall very satisfied with my living experience here."
];

export function AnalyticsDemo() {
  const [activeDemo, setActiveDemo] = useState<'complaints' | 'feedback' | 'custom'>('complaints');
  const [customTexts, setCustomTexts] = useState<string[]>([]);

  const getDemoTexts = () => {
    switch (activeDemo) {
      case 'complaints':
        return SAMPLE_COMPLAINTS;
      case 'feedback':
        return SAMPLE_FEEDBACK;
      case 'custom':
        return customTexts;
      default:
        return [];
    }
  };

  const getDemoTitle = () => {
    switch (activeDemo) {
      case 'complaints':
        return 'Complaint Analysis';
      case 'feedback':
        return 'Resident Feedback Analysis';
      case 'custom':
        return 'Custom Text Analysis';
      default:
        return 'Text Analysis';
    }
  };

  const getDemoDescription = () => {
    switch (activeDemo) {
      case 'complaints':
        return 'Analyze sentiment patterns in resident complaints to identify areas for improvement';
      case 'feedback':
        return 'Process resident feedback to understand satisfaction levels and trends';
      case 'custom':
        return 'Analyze your own text data for sentiment and key themes';
      default:
        return 'Text analytics for property management';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Text Analytics Demo
          </CardTitle>
          <CardDescription>
            Explore sentiment analysis and word cloud capabilities for property management data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant={activeDemo === 'complaints' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('complaints')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Complaints Demo
            </Button>
            <Button
              variant={activeDemo === 'feedback' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('feedback')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Feedback Demo
            </Button>
            <Button
              variant={activeDemo === 'custom' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('custom')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Custom Analysis
            </Button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">{getDemoTitle()}</h3>
            <p className="text-sm text-muted-foreground">{getDemoDescription()}</p>
          </div>

          {activeDemo !== 'custom' && (
            <div className="mb-4">
              <Badge variant="secondary" className="mb-2">
                Sample Data ({getDemoTexts().length} texts)
              </Badge>
              <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                {getDemoTexts().slice(0, 3).map((text, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-gray-600">
                    "{text.substring(0, 100)}..."
                  </div>
                ))}
                {getDemoTexts().length > 3 && (
                  <div className="text-center text-gray-500 py-1">
                    ... and {getDemoTexts().length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Complete Analysis</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Only</TabsTrigger>
          <TabsTrigger value="wordcloud">Word Cloud Only</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Text Analytics Dashboard</CardTitle>
              <CardDescription>
                Full analysis including sentiment distribution, word frequency, and visual word cloud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextAnalyticsDashboard 
                texts={getDemoTexts()}
                onAnalysisComplete={(result) => {
                  console.log('Analysis completed:', result);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>
                Analyze the emotional tone and sentiment of individual texts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SentimentAnalyzer 
                initialText={getDemoTexts()[0] || ""}
                autoAnalyze={false}
                onAnalysisComplete={(result) => {
                  console.log('Sentiment analysis:', result);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordcloud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Word Cloud Generator</CardTitle>
              <CardDescription>
                Create visual representations of key themes and frequently used words
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WordCloudGenerator 
                initialText={getDemoTexts().join(' ')}
                autoGenerate={false}
                onWordCloudGenerated={(imageBase64) => {
                  console.log('Word cloud generated');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integration Use Cases</CardTitle>
          <CardDescription>
            How text analytics can enhance your property management workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Complaint Management</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Automatically categorize complaint severity</li>
                <li>• Identify recurring issues and patterns</li>
                <li>• Prioritize urgent complaints based on sentiment</li>
                <li>• Track resolution effectiveness over time</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">Feedback Analysis</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Measure resident satisfaction trends</li>
                <li>• Identify popular amenities and services</li>
                <li>• Discover improvement opportunities</li>
                <li>• Generate insights for management reports</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">Communication Insights</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Analyze staff communication effectiveness</li>
                <li>• Monitor tenant-staff interaction quality</li>
                <li>• Identify training opportunities</li>
                <li>• Improve response strategies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-700">Reporting & Analytics</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Generate automated sentiment reports</li>
                <li>• Create visual dashboards for stakeholders</li>
                <li>• Track KPIs and performance metrics</li>
                <li>• Support data-driven decision making</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
