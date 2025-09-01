import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integration/supabase/client';
import { Zap, CheckCircle } from 'lucide-react';

export function QuickPropertyFix() {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const quickFix = async () => {
    setIsFixing(true);
    try {
      console.log('⚡ Quick fix: Creating properties from assignments...');

      // Get unique properties from assignments
      const { data: assignments, error: assignError } = await (supabase
        .from('assignments') as any)
        .select('property_id, property_name')
        .not('property_id', 'is', null)
        .not('property_name', 'is', null);

      if (assignError) {
        setResults(`Error: ${assignError.message}`);
        return;
      }

      // Create unique properties with minimal required fields
      const uniqueProperties = new Map();
      (assignments || []).forEach((a: any) => {
        if (!uniqueProperties.has(a.property_id)) {
          uniqueProperties.set(a.property_id, {
            id: a.property_id,
            title: a.property_name,
            address: a.property_name,
            price: 1000,
            bedrooms: 1,
            bathrooms: 1,
            area: 1000,
            type: 'Apartment',
            status: 'Rented',
            image: 'placeholder.jpg',
            description: 'Property from assignment data'
          });
        }
      });

      console.log(`Creating ${uniqueProperties.size} properties...`);

      // Insert properties
      const propertyData = Array.from(uniqueProperties.values());
      const { data: propResult, error: propError } = await (supabase
        .from('properties') as any)
        .upsert(propertyData, { onConflict: 'id' });

      if (propError) {
        setResults(`Property insert error: ${propError.message}`);
        return;
      }

      setResults(`✅ Created ${propertyData.length} properties successfully!`);

    } catch (error) {
      setResults(`Fix failed: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="w-full border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-400">
          <Zap className="h-5 w-5" />
          Quick Property Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Quick Fix:</strong> Creates missing properties from assignment data 
            with minimal required fields to restore foreign key relationships.
          </AlertDescription>
        </Alert>

        <Button
          onClick={quickFix}
          disabled={isFixing}
          className="w-full"
          variant="default"
        >
          {isFixing ? 'Fixing...' : 'Create Missing Properties'}
        </Button>

        {results && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {results}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
