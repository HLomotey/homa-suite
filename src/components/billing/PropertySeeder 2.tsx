import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integration/supabase/client';
import { Database, CheckCircle } from 'lucide-react';

export function PropertySeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<{
    propertiesCreated: number;
    roomsCreated: number;
    errors: string[];
  } | null>(null);

  const seedPropertiesAndRooms = async () => {
    setIsSeeding(true);
    const errors: string[] = [];
    let propertiesCreated = 0;
    let roomsCreated = 0;

    try {
      console.log('🌱 Seeding properties and rooms from assignment data...');

      // 1. Get unique properties from assignments
      const { data: assignments, error: assignError } = await (supabase
        .from('assignments') as any)
        .select('property_id, property_name, room_id, room_name')
        .not('property_id', 'is', null)
        .not('room_id', 'is', null);

      if (assignError) {
        errors.push(`Error fetching assignments: ${assignError.message}`);
        setResults({ propertiesCreated: 0, roomsCreated: 0, errors });
        return;
      }

      // 2. Create unique properties
      const uniqueProperties = new Map();
      const uniqueRooms = new Map();

      (assignments || []).forEach((a: any) => {
        if (a.property_id && a.property_name) {
          uniqueProperties.set(a.property_id, {
            id: a.property_id,
            title: a.property_name,
            address: a.property_name, // Use property_name as address fallback
            price: 0,
            bedrooms: 1,
            bathrooms: 1,
            area: 1000,
            type: 'Apartment',
            status: 'Rented',
            image: '',
            description: `Property created from assignment data`,
            date_added: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          });
        }
        
        if (a.room_id && a.room_name && a.property_id) {
          uniqueRooms.set(a.room_id, {
            id: a.room_id,
            name: a.room_name,
            property_id: a.property_id,
            property_name: a.property_name, // Required by rooms table
            created_at: new Date().toISOString()
          });
        }
      });

      console.log(`🏢 Found ${uniqueProperties.size} unique properties and ${uniqueRooms.size} unique rooms`);

      // 3. Insert properties
      if (uniqueProperties.size > 0) {
        const propertyData = Array.from(uniqueProperties.values());
        const { data: propData, error: propInsertError } = await (supabase
          .from('properties') as any)
          .upsert(propertyData, { onConflict: 'id' })
          .select();

        if (propInsertError) {
          errors.push(`Error inserting properties: ${propInsertError.message}`);
        } else {
          propertiesCreated = propData?.length || 0;
          console.log(`✅ Created ${propertiesCreated} properties`);
        }
      }

      // 4. Insert rooms
      if (uniqueRooms.size > 0) {
        const roomData = Array.from(uniqueRooms.values());
        const { data: roomInsertData, error: roomInsertError } = await (supabase
          .from('rooms') as any)
          .upsert(roomData, { onConflict: 'id' })
          .select();

        if (roomInsertError) {
          errors.push(`Error inserting rooms: ${roomInsertError.message}`);
        } else {
          roomsCreated = roomInsertData?.length || 0;
          console.log(`✅ Created ${roomsCreated} rooms`);
        }
      }

      setResults({ propertiesCreated, roomsCreated, errors });

    } catch (error) {
      errors.push(`Seeding failed: ${error}`);
      setResults({ propertiesCreated: 0, roomsCreated: 0, errors });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Property & Room Seeder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Fix Missing Properties:</strong> This will create properties and rooms tables 
            from existing assignment data to fix foreign key relationships.
          </AlertDescription>
        </Alert>

        <Button
          onClick={seedPropertiesAndRooms}
          disabled={isSeeding}
          className="w-full"
          variant="outline"
        >
          {isSeeding ? 'Seeding...' : 'Seed Properties & Rooms'}
        </Button>

        {results && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Seeding Results:</strong>
              <div className="mt-2 space-y-1">
                <div>Properties created: {results.propertiesCreated}</div>
                <div>Rooms created: {results.roomsCreated}</div>
                {results.errors.length > 0 && (
                  <div className="text-red-500">
                    Errors: {results.errors.join(', ')}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
