import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CreateJobOrderRequest, PriorityLevel, JobOrderWithDetails } from '@/types/job-order';

interface JobOrderFormProps {
  jobOrder?: JobOrderWithDetails;
  onSubmit?: (data: CreateJobOrderRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

interface Position {
  role_title: string;
  shift_type: string;
  site_location: string;
  seats_requested: number;
  seats_filled: number;
  requirements: string;
  hourly_rate: number;
}

const JobOrderForm: React.FC<JobOrderFormProps> = ({
  jobOrder,
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<CreateJobOrderRequest>({
    title: '',
    description: '',
    organization_id: '',
    site_location: '',
    seats_requested: 1,
    priority: 'MEDIUM',
    notes: '',
    positions: []
  });

  const [positions, setPositions] = useState<Position[]>([]);
  const [requestedStartDate, setRequestedStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [fillByDate, setFillByDate] = useState<Date>();

  useEffect(() => {
    if (jobOrder) {
      setFormData({
        title: jobOrder.title,
        description: jobOrder.description || '',
        organization_id: jobOrder.organization_id,
        site_location: jobOrder.site_location || '',
        seats_requested: jobOrder.seats_requested,
        priority: jobOrder.priority,
        notes: jobOrder.notes || '',
        positions: []
      });

      if (jobOrder.requested_start_date) {
        setRequestedStartDate(new Date(jobOrder.requested_start_date));
      }
      if (jobOrder.due_date) {
        setDueDate(new Date(jobOrder.due_date));
      }
      if (jobOrder.fill_by_date) {
        setFillByDate(new Date(jobOrder.fill_by_date));
      }
    }
  }, [jobOrder]);

  const handleInputChange = (field: keyof CreateJobOrderRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPosition = () => {
    setPositions(prev => [...prev, {
      role_title: '',
      shift_type: '',
      site_location: '',
      seats_requested: 1,
      seats_filled: 0,
      requirements: '',
      hourly_rate: 0
    }]);
  };

  const updatePosition = (index: number, field: keyof Position, value: any) => {
    setPositions(prev => prev.map((pos, i) => 
      i === index ? { ...pos, [field]: value } : pos
    ));
  };

  const removePosition = (index: number) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: CreateJobOrderRequest = {
      ...formData,
      requested_start_date: requestedStartDate?.toISOString().split('T')[0],
      due_date: dueDate?.toISOString().split('T')[0],
      fill_by_date: fillByDate?.toISOString(),
      positions: positions.length > 0 ? positions : undefined
    };

    await onSubmit(submitData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {jobOrder ? 'Edit Job Order' : 'Create New Job Order'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter job title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_id">Organization *</Label>
              <Input
                id="organization_id"
                value={formData.organization_id}
                onChange={(e) => handleInputChange('organization_id', e.target.value)}
                placeholder="Organization ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_location">Site Location</Label>
              <Input
                id="site_location"
                value={formData.site_location}
                onChange={(e) => handleInputChange('site_location', e.target.value)}
                placeholder="Enter site location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats_requested">Seats Requested *</Label>
              <Input
                id="seats_requested"
                type="number"
                min="1"
                value={formData.seats_requested}
                onChange={(e) => handleInputChange('seats_requested', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Requested Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !requestedStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {requestedStartDate ? format(requestedStartDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={requestedStartDate}
                    onSelect={setRequestedStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fill By Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fillByDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fillByDate ? format(fillByDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fillByDate}
                    onSelect={setFillByDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as PriorityLevel)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Positions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-medium">Position Details (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPosition}>
                <Plus className="w-4 h-4 mr-2" />
                Add Position
              </Button>
            </div>

            {positions.map((position, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Position {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePosition(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role Title</Label>
                    <Input
                      value={position.role_title}
                      onChange={(e) => updatePosition(index, 'role_title', e.target.value)}
                      placeholder="Enter role title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shift Type</Label>
                    <Input
                      value={position.shift_type}
                      onChange={(e) => updatePosition(index, 'shift_type', e.target.value)}
                      placeholder="e.g., Day Shift, Night Shift"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Site Location</Label>
                    <Input
                      value={position.site_location}
                      onChange={(e) => updatePosition(index, 'site_location', e.target.value)}
                      placeholder="Enter site location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Seats Requested</Label>
                    <Input
                      type="number"
                      min="1"
                      value={position.seats_requested}
                      onChange={(e) => updatePosition(index, 'seats_requested', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Seats Filled</Label>
                    <Input
                      type="number"
                      min="0"
                      value={position.seats_filled}
                      onChange={(e) => updatePosition(index, 'seats_filled', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hourly Rate</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={position.hourly_rate}
                      onChange={(e) => updatePosition(index, 'hourly_rate', parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Requirements</Label>
                  <Textarea
                    value={position.requirements}
                    onChange={(e) => updatePosition(index, 'requirements', e.target.value)}
                    placeholder="Enter position requirements"
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : (jobOrder ? 'Update Job Order' : 'Create Job Order')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobOrderForm;
