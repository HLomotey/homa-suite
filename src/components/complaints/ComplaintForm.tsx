/**
 * Complaint submission form component
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/auth";
import { useComplaints, useComplaintCategories, useComplaintSubcategories } from "@/hooks/complaints";
import { ComplaintAssetType, ComplaintPriority } from "@/integration/supabase/types/complaints";
import { useUsersByRole } from "@/hooks/user-profile/useEnhancedUsers";
import { FrontendUser } from "@/integration/supabase/types";
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

// Define the form schema with Zod
const complaintFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  assetType: z.enum(["property", "transport"]),
  assetId: z.string().min(1, "Please select an asset"),
  categoryId: z.string().min(1, "Please select a category"),
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
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  
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

  // Fetch properties and vehicles
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoadingAssets(true);
      try {
        // Fetch properties
        const { data: propertiesData } = await fetch("/api/properties").then(res => res.json());
        if (propertiesData) {
          setProperties(propertiesData);
        }

        // Fetch vehicles
        const { data: vehiclesData } = await fetch("/api/vehicles").then(res => res.json());
        if (vehiclesData) {
          setVehicles(vehiclesData);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
        toast({
          title: "Error",
          description: "Failed to load assets. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

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
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || undefined,
        priority: data.priority,
        contactMethod: data.contactMethod,
        location: data.location,
        userId: user.id,
        supervisorId: data.supervisorId || undefined,
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
    <div className="w-full text-white">
      <div className="mb-6">
        <p className="text-blue-400 mb-2">Fill out the form below to submit a new complaint.</p>
        <p className="text-sm text-blue-300">All fields marked with <span className="text-blue-400">*</span> are required.</p>
      </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Title <span className="text-blue-400">*</span></FormLabel>
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
                            <RadioGroupItem value="vehicle" className="border-blue-500 text-blue-500" />
                          </FormControl>
                          <FormLabel className="font-normal text-white">
                            Vehicle
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      Select whether this complaint is about a property or a vehicle.
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
                    <FormLabel className="text-blue-400">Asset <span className="text-blue-400">*</span></FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!assetType || isLoadingAssets}
                      >
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                          {isLoadingAssets ? (
                            <SelectItem value="loading" disabled>
                              Loading assets...
                            </SelectItem>
                          ) : assetType === "property" ? (
                            properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))
                          ) : (
                            vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-blue-300 text-xs">
                      Select the specific {assetType} this complaint is about.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                        {isLoadingCategories ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading categories...</span>
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
                    <FormDescription className="text-blue-300 text-xs">
                      Select the category that best describes your complaint.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select a subcategory (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                        {isLoadingSubcategories ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading subcategories...</span>
                          </div>
                        ) : (
                          subcategories?.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-blue-300 text-xs">
                      Optionally select a subcategory for more specific classification.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select priority" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="both">Both Email and Phone</SelectItem>
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
                  <FormControl>
                    <Input 
                      placeholder="Specific location (optional)" 
                      {...field} 
                      className="bg-[#0a1428] border-[#1e3a5f] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription className="text-blue-300 text-xs">
                    Optionally provide a specific location related to this complaint (e.g., "Room 302" or "Parking Lot B").
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-400">Send to Supervisor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0a1428] border-[#1e3a5f] text-white focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select a supervisor (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0a1428] border-[#1e3a5f] text-white">
                      {isLoadingSupervisors ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading supervisors...</span>
                        </div>
                      ) : (
                        supervisors?.map((supervisor) => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.name || supervisor.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-blue-300 text-xs">
                    Optionally select a supervisor to escalate this complaint to.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
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
  );
}
