import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalStaffExcelUpload } from './ExternalStaffExcelUpload';

export function ExcelUploadTest() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🧪 Excel Upload Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setShowUpload(true)}
          className="w-full"
        >
          Test Excel Upload
        </Button>
        
        {showUpload && (
          <ExternalStaffExcelUpload 
            onClose={() => setShowUpload(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
