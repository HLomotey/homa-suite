import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth";
import { useCreateMaintenanceRequest } from "@/hooks/maintenance";
import { useMaintenanceCategories } from "@/hooks/maintenance/useMaintenanceCategories";
import { useMaintenancePriorities } from "@/hooks/maintenance/useMaintenancePriorities";
import { Loader2, Upload, X } from "lucide-react";
import { FrontendMaintenanceRequest } from "@/integration/supabase/types/maintenance";
import { useProperties } from "@/hooks/property";
import { useRoomsByProperty } from "@/hooks/room";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  propertyId: z.string().min(1, "Property is required"),
  roomId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  priorityId: z.string().min(1, "Priority is required"),
  isEmergency: z.boolean().default(false),
  permissionToEnter: z.boolean().default(false),
  tenantAvailableTimes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportMaintenanceIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const { data: categories, isLoading: loadingCategories } = useMaintenanceCategories();
  const { data: priorities, isLoading: loadingPriorities } = useMaintenancePriorities();
  const { mutate: createRequest, isPending } = useCreateMaintenanceRequest();
  
  // Fetch properties from database
  const { properties, loading: loadingProperties, error: propertiesError } = useProperties();
  
  // Fetch rooms based on selected property
  const [propertyRooms, setPropertyRooms] = useState<{ id: string; name: string; propertyId: string }[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyId: "",
      roomId: "",
      categoryId: "",
      priorityId: "",
      isEmergency: false,
      permissionToEnter: true,
      tenantAvailableTimes: "",
    },
  });
  
  const selectedPropertyId = form.watch("propertyId");
  
  // Use the useRoomsByProperty hook when a property is selected
  const { 
    rooms: fetchedRooms, 
    loading: fetchingRooms, 
    error: roomsError,
    refetch: refetchRooms 
  } = useRoomsByProperty(selectedPropertyId);
  
  // Update local rooms state when fetched rooms change
  useEffect(() => {
    if (fetchedRooms) {
      setLoadingRooms(fetchingRooms);
      // Map the fetched rooms to the format expected by the form
      const mappedRooms = fetchedRooms.map(room => ({
        id: room.id,
        name: room.name,
        propertyId: room.propertyId
      }));
      setPropertyRooms(mappedRooms);
    }
  }, [fetchedRooms, fetchingRooms]);
  
  // Reset room selection when property changes
  useEffect(() => {
    if (selectedPropertyId) {
      form.setValue("roomId", "");
    }
  }, [selectedPropertyId, form]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    setImages(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newUrls]);
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit = (values: FormValues) => {
    // Prepare request data
    const requestData: Omit<FrontendMaintenanceRequest, "id"> = {
      title: values.title,
      description: values.description,
      tenantId: user?.id || null, // Use actual tenant ID if available
      propertyId: values.propertyId,
      roomId: values.roomId || null,
      categoryId: values.categoryId,
      priorityId: values.priorityId,
      status: "new",
      reportedDate: new Date().toISOString(),
      assignedDate: null,
      assignedTo: null,
      scheduledDate: null,
      completedDate: null,
      isEmergency: values.isEmergency,
      permissionToEnter: values.permissionToEnter,
      tenantAvailableTimes: values.tenantAvailableTimes ? values.tenantAvailableTimes : null,
      images: null, // Will be handled separately
    };
    
    // TODO: Handle image uploads to storage
    // For now, we'll just create the request without images
    
    createRequest(requestData, {
      onSuccess: () => {
        toast({
          title: "Maintenance request submitted",
          description: "Your maintenance request has been submitted successfully.",
        });
        navigate("/maintenance/requests");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to submit maintenance request: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Report Maintenance Issue</CardTitle>
          <CardDescription>
            Submit a new maintenance request for your property or room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the issue" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a short, clear title for your maintenance issue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe the issue in detail" 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include relevant details about the issue, when it started, and any other important information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingProperties ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : properties && properties.length > 0 ? (
                            properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.title}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-gray-500">
                              No properties available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedPropertyId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedPropertyId ? (
                            <div className="p-2 text-center text-sm text-gray-500">
                              Select a property first
                            </div>
                          ) : loadingRooms ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : propertyRooms && propertyRooms.length > 0 ? (
                            propertyRooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-gray-500">
                              No rooms available for this property
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingCategories ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priorityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingPriorities ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            priorities?.map((priority) => (
                              <SelectItem key={priority.id} value={priority.id}>
                                {priority.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isEmergency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Emergency Issue</FormLabel>
                      <FormDescription>
                        Mark this issue as an emergency requiring immediate attention
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="permissionToEnter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Permission to Enter</FormLabel>
                      <FormDescription>
                        Allow maintenance staff to enter your room/property when you're not present
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tenantAvailableTimes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Times (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Weekdays after 5pm, Weekends anytime" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Specify times when you are available if permission to enter is not granted
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Upload Images (Optional)</FormLabel>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove image</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Maintenance Request"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
