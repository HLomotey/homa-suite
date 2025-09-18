/**
 * Word Cloud Generator Component
 * Creates visual word clouds from text data
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Download, Palette } from 'lucide-react';
import { generateWordCloud, WordCloudConfig } from '../../hooks/analytics/text-analytics-api';

interface WordCloudGeneratorProps {
  initialText?: string;
  onWordCloudGenerated?: (imageBase64: string) => void;
  autoGenerate?: boolean;
}

export function WordCloudGenerator({ 
  initialText = '', 
  onWordCloudGenerated,
  autoGenerate = false 
}: WordCloudGeneratorProps) {
  const [text, setText] = useState(initialText);
  const [wordCloudImage, setWordCloudImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WordCloudConfig>({
    width: 800,
    height: 400,
    background_color: 'white',
    max_words: 100,
    colormap: 'viridis'
  });

  const colormaps = [
    'viridis', 'plasma', 'inferno', 'magma', 'cividis',
    'Blues', 'Greens', 'Reds', 'Oranges', 'Purples',
    'cool', 'hot', 'spring', 'summer', 'autumn', 'winter'
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await generateWordCloud(text, config);
      setWordCloudImage(result.word_cloud_base64);
      onWordCloudGenerated?.(result.word_cloud_base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Word cloud generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when text or config changes (with debounce)
  useEffect(() => {
    if (!autoGenerate || !text.trim()) return;

    const timer = setTimeout(() => {
      handleGenerate();
    }, 1500);

    return () => clearTimeout(timer);
  }, [text, config, autoGenerate]);

  const handleDownload = () => {
    if (!wordCloudImage) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${wordCloudImage}`;
    link.download = `wordcloud-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Word Cloud Generator
        </CardTitle>
        <CardDescription>
          Create visual word clouds to identify key themes and patterns in text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="text-input">Text Content</Label>
          <Textarea
            id="text-input"
            placeholder="Enter text to generate word cloud..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={config.width}
              onChange={(e) => setConfig(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
              min="200"
              max="1600"
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={config.height}
              onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) || 400 }))}
              min="200"
              max="800"
            />
          </div>
          <div>
            <Label htmlFor="max-words">Max Words</Label>
            <Input
              id="max-words"
              type="number"
              value={config.max_words}
              onChange={(e) => setConfig(prev => ({ ...prev, max_words: parseInt(e.target.value) || 100 }))}
              min="10"
              max="500"
            />
          </div>
          <div>
            <Label htmlFor="colormap">Color Scheme</Label>
            <Select
              value={config.colormap}
              onValueChange={(value) => setConfig(prev => ({ ...prev, colormap: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colormaps.map((colormap) => (
                  <SelectItem key={colormap} value={colormap}>
                    {colormap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bg-color">Background Color</Label>
            <Select
              value={config.background_color}
              onValueChange={(value) => setConfig(prev => ({ ...prev, background_color: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="transparent">Transparent</SelectItem>
                <SelectItem value="#f8f9fa">Light Gray</SelectItem>
                <SelectItem value="#343a40">Dark Gray</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!autoGenerate && (
          <Button 
            onClick={handleGenerate} 
            disabled={!text.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Word Cloud...
              </>
            ) : (
              'Generate Word Cloud'
            )}
          </Button>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {wordCloudImage && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Generated Word Cloud</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={`data:image/png;base64,${wordCloudImage}`}
                alt="Generated Word Cloud"
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
