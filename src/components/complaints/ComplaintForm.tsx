/**
 * Complaint submission form component
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/auth";
import { useComplaints, useComplaintCategories, useComplaintSubcategories } from "@/hooks/complaints";
import { ComplaintAssetType, ComplaintPriority, ComplaintStatus } from "@/integration/supabase/types/complaints";
import { useUsersByRole } from "@/hooks/user-profile/useEnhancedUsers";
import { FrontendUser } from "@/integration/supabase/types";
import { useProperties } from "@/hooks/property/useProperty";
import { useVehicle } from "@/hooks/transport/useVehicle";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";

// Define the form schema with Zod
const complaintFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  assetType: z.enum(["property", "hotel", "vehicle"]),
  assetId: z.string().min(1, "Please enter an asset ID"),
  categoryId: z.string().min(1, "Please enter a category"),
  subcategoryId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  contactMethod: z.enum(["email", "phone", "both"]),
  location: z.string().optional(),
  supervisorId: z.string().optional(),
});

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

interface ComplaintFormProps {
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export function ComplaintForm({ onSuccess, onCancel }: ComplaintFormProps) {
  const { user } = useAuth();
  const { createComplaint, isCreating } = useComplaints();
  const [assetType, setAssetType] = useState<ComplaintAssetType>("property");
  const [categoryId, setCategoryId] = useState<string>("");
  
  // Fetch properties using the same hook as properties page
  const { properties, loading: isLoadingProperties } = useProperties();
  
  // Fetch vehicles using the same hook as transport page
  const { vehicles, loading: isLoadingVehicles } = useVehicle();
  
  // Fetch staff locations for the location dropdown
  const { staffLocations, loading: isLoadingStaffLocations } = useStaffLocation();
  
  // Fetch supervisors
  const { users: supervisors, loading: isLoadingSupervisors } = useUsersByRole("supervisor");

  // Fetch categories based on selected asset type
  const { categories, isLoading: isLoadingCategories } = useComplaintCategories(assetType);
  
  // Fetch subcategories based on selected category
  const { subcategories, isLoading: isLoadingSubcategories } = useComplaintSubcategories(categoryId);

  // Initialize form
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assetType: "property",
      assetId: "",
      categoryId: "",
      subcategoryId: "",
      priority: "medium",
      contactMethod: "email",
      location: "",
      supervisorId: "",
    },
  });

  // Watch for asset type changes
  const watchedAssetType = form.watch("assetType");
  useEffect(() => {
    setAssetType(watchedAssetType as ComplaintAssetType);
    form.setValue("assetId", "");
    form.setValue("categoryId", "");
    form.setValue("subcategoryId", "");
    setCategoryId("");
  }, [watchedAssetType, form]);

  // Watch for category changes
  const watchedCategoryId = form.watch("categoryId");
  useEffect(() => {
    setCategoryId(watchedCategoryId);
    form.setValue("subcategoryId", "");
  }, [watchedCategoryId, form]);

  // Watch for asset ID changes to auto-populate supervisor ID
  const watchedAssetId = form.watch("assetId");
  useEffect(() => {
    if (watchedAssetId && assetType === "property") {
      const selectedProperty = properties.find(property => property.id === watchedAssetId);
      if (selectedProperty && selectedProperty.managerId) {
        form.setValue("supervisorId", selectedProperty.managerId);
      }
    }
  }, [watchedAssetId, assetType, properties, form]);


  // Handle form submission
  const onSubmit = async (data: ComplaintFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a complaint",
        variant: "destructive",
      });
      return;
    }

    try {
      const complaintId = await createComplaint({
        title: data.title,
        description: data.description,
        asset_type: data.assetType,
        asset_id: data.assetId,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId || undefined,
        priority: data.priority,
        contact_method: data.contactMethod,
        location: data.location,
        created_by: user.id,
        assigned_to: data.supervisorId || null,
        status: "new",
        escalated_to: null,
        due_date: null,
        resolved_at: null,
        closed_at: null,
      });

      toast({
        title: "Success",
        description: "Complaint submitted successfully",
        variant: "default",
      });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof complaintId === 'string') {
        onSuccess(complaintId);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-lg font-semibold">Add New Complaint</h2>
          <p className="text-sm text-muted-foreground">Fill in the details to create a new complaint.</p>
        </div>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">All fields marked with <span className="text-red-500">*</span> are required.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief title of your complaint" 
                      {...field} 
                      className="bg-[#0a1428] border-[#1e3a5f] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription className="text-blue-300 text-xs">
                    Provide a short, descriptive title for your complaint.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Description <span className="text-blue-400">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of your complaint"
                      className="min-h-[120px] bg-[#0a1428] border-[#1e3a5f] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-blue-300 text-xs">
                    Provide a detailed description of the issue, including when it occurred and any relevant details.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Asset Type <span className="text-blue-400">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="property" className="border-blue-500 text-blue-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-white">
                            Property
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="hotel" className="border-blue-500 text-blue-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-white">
                            Hotel
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="vehicle" className="border-blue-500 text-blue-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-white">
                            Vehicle
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      Select whether this complaint is about a property, hotel, or a vehicle.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">{assetType === 'property' ? 'Property' : 'Vehicle'} <span className="text-blue-400">*</span></FormLabel>
                    <FormControl>
                      {(assetType === 'property' ? isLoadingProperties : isLoadingVehicles) ? (
                        <div className="flex items-center space-x-2 p-3 bg-[#0a1428] border border-[#1e3a5f] rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          <span className="text-sm text-gray-400">Loading {assetType === 'property' ? 'properties' : 'vehicles'}...</span>
                        </div>
                      ) : (
                        <SearchableSelect
                          options={assetType === 'property' 
                            ? properties.map((property): SearchableSelectOption => ({
                                value: property.id,
                                label: `${property.title} - ${property.address}`,
                                searchText: `${property.title} ${property.address}`
                              }))
                            : vehicles.map((vehicle): SearchableSelectOption => ({
                                value: vehicle.id,
                                label: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
                                searchText: `${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}`
                              }))
                          }
                          value={field.value}
                          placeholder={`Search and select ${assetType}...`}
                          emptyMessage={`No ${assetType === 'property' ? 'properties' : 'vehicles'} found.`}
                          onValueChange={field.onChange}
                          className="bg-[#0a1428] border-[#1e3a5f] text-white"
                        />
                      )}
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      Select the {assetType} this complaint is about.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Category <span className="text-blue-400">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter complaint category"
                        {...field}
                        className="bg-[#0a1428] border-[#1e3a5f] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      Enter the category that best describes your complaint.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Subcategory</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter subcategory (optional)"
                        {...field}
                        className="bg-[#0a1428] border-[#1e3a5f] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      Optionally enter a subcategory for more specific classification.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Priority <span className="text-blue-400">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-blue-300 text-xs">
                      Select the priority level for this complaint.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400">Preferred Contact Method <span className="text-blue-400">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-blue-300 text-xs">
                      How would you prefer to be contacted about this complaint?
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white max-h-[300px]">
                      {isLoadingStaffLocations ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-400 mr-2" />
                          <span>Loading locations...</span>
                        </div>
                      ) : staffLocations.length === 0 ? (
                        <div className="p-2 text-center">No locations found</div>
                      ) : (
                        staffLocations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.locationDescription}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-blue-300 text-xs">
                    Select a location from the staff locations list.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => {
                const selectedProperty = properties.find(p => p.id === form.watch("assetId"));
                const selectedLocation = staffLocations.find(loc => loc.id === form.watch("location"));
                
                // Get manager based on selected asset type and selection
                let managerName = "";
                let managerId = "";
                
                if (assetType === "property" && selectedProperty?.managerName) {
                  managerName = selectedProperty.managerName;
                  managerId = selectedProperty.managerId || "";
                } else if (selectedLocation?.externalStaffName) {
                  managerName = selectedLocation.externalStaffName;
                  managerId = selectedLocation.externalStaffId || "";
                }
                
                // Update the form value when manager changes
                useEffect(() => {
                  if (managerId) {
                    field.onChange(managerId);
                  }
                }, [managerId]);
                
                return (
                  <FormItem>
                    <FormLabel className="text-blue-400">Manager</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={managerName || "No manager assigned"}
                        value={managerName || ""}
                        readOnly
                        className="bg-[#0a1428] border-[#1e3a5f] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed opacity-75"
                      />
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      {managerName ? (
                        <>Automatically assigned based on selected {assetType === "property" ? "property" : "location"}</>
                      ) : (
                        "Manager will be assigned when you select a property or location"
                      )}
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-end pt-6 space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isCreating}
                className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-900 hover:text-blue-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Complaint
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
