import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { FrontendProperty, PropertyStatus, PropertyType } from '../../integration/supabase/types';

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: FrontendProperty;
  onSubmit: (data: Omit<FrontendProperty, 'id' | 'dateAdded'>) => Promise<void>;
}

export const AddPropertyDialog = ({
  open,
  onOpenChange,
  property,
  onSubmit,
}: AddPropertyDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<FrontendProperty, 'id' | 'dateAdded'>>({
    title: '',
    address: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    type: 'House' as PropertyType,
    status: 'Available' as PropertyStatus,
    image: '',
    description: '',
  });

  // If property is provided, populate form with its data (for editing)
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        address: property.address,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        type: property.type as PropertyType,
        status: property.status as PropertyStatus,
        image: property.image,
        description: property.description,
      });
    } else {
      // Reset form when adding a new property
      setFormData({
        title: '',
        address: '',
        price: 0,
        bedrooms: 1,
        bathrooms: 1,
        area: 0,
        type: 'House' as PropertyType,
        status: 'Available' as PropertyStatus,
        image: '',
        description: '',
      });
    }
  }, [property, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);

      // Form will be reset by the useEffect when dialog closes
      // Dialog will be closed by the parent component
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: 'Error',
        description: 'There was an error processing the property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {property ? 'Update the property details.' : 'Fill in the details to add a new property to your portfolio.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="bedrooms" className="text-right">
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="bathrooms" className="text-right">
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="area" className="text-right">
              Area (sq ft)
            </Label>
            <Input
              id="area"
              type="number"
              min="0"
              value={formData.area}
              onChange={(e) => handleChange('area', Number(e.target.value))}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(['Apartment', 'House', 'Condo', 'Townhouse', 'Land', 'Studio', 'Loft'] as PropertyType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(['Available', 'Pending', 'Sold', 'Rented'] as PropertyStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image URL
            </Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="col-span-3"
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : property ? "Update Property" : "Add Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};