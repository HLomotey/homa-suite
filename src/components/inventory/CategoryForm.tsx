/**
 * CategoryForm component
 * Form for creating and editing inventory categories
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { Loader2, Palette } from "lucide-react";
import { FrontendInventoryCategory } from "../../integration/supabase/types/inventory";
import { useInventoryCategories, useInventoryCategory, useCreateInventoryCategory, useUpdateInventoryCategory } from "../../hooks/inventory/useInventoryCategories";

// Icon options for categories
const CATEGORY_ICONS = [
  'Armchair', 'Zap', 'Monitor', 'Bed', 'ChefHat', 'Spray', 'Bath', 
  'Lightbulb', 'Palette', 'Shield', 'Wind', 'Wrench', 'Hammer', 
  'FileText', 'Settings', 'Package', 'Home', 'Car', 'Briefcase', 
  'Heart', 'Star', 'Tool', 'Truck', 'Building'
];

// Color options for categories
const CATEGORY_COLORS = [
  '#8B4513', '#4169E1', '#32CD32', '#FF69B4', '#FF6347', '#00CED1',
  '#87CEEB', '#FFD700', '#DDA0DD', '#FF4500', '#708090', '#4682B4',
  '#2F4F4F', '#696969', '#8FBC8F', '#A9A9A9', '#DC143C', '#FF8C00',
  '#9932CC', '#228B22', '#B22222', '#4B0082', '#8B008B', '#556B2F'
];

// Form schema validation
const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  parentCategoryId: z.string().optional(),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
  iconName: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0, "Sort order must be a positive number"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  onSuccess: () => void;
}

export function CategoryForm({
  isOpen,
  onClose,
  categoryId,
  onSuccess,
}: CategoryFormProps) {
  const { toast } = useToast();
  const isEditing = !!categoryId;
  const [isLoading, setIsLoading] = useState(false);
  
  // Load categories for parent selection
  const { categories } = useInventoryCategories();
  
  // Load category data for editing
  const { category: existingCategory, loading: categoryLoading } = useInventoryCategory(categoryId || null);
  
  // API hooks
  const { create } = useCreateInventoryCategory();
  const { update } = useUpdateInventoryCategory();

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentCategoryId: "",
      colorCode: CATEGORY_COLORS[0],
      iconName: CATEGORY_ICONS[0],
      sortOrder: categories.length + 1,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingCategory && !categoryLoading) {
      form.reset({
        name: existingCategory.name,
        description: existingCategory.description || "",
        parentCategoryId: existingCategory.parentCategoryId || "",
        colorCode: existingCategory.colorCode || CATEGORY_COLORS[0],
        iconName: existingCategory.iconName || CATEGORY_ICONS[0],
        sortOrder: existingCategory.sortOrder,
      });
    } else if (!isEditing) {
      // Reset form for new category
      form.reset({
        name: "",
        description: "",
        parentCategoryId: "",
        colorCode: CATEGORY_COLORS[0],
        iconName: CATEGORY_ICONS[0],
        sortOrder: categories.length + 1,
      });
    }
  }, [form, isEditing, existingCategory, categoryLoading, categories.length]);

  // Get parent category options (exclude current category and its children)
  const parentCategoryOptions = categories.filter(cat => 
    cat.id !== categoryId && !cat.parentCategoryId
  );

  // Form submission handler
  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    try {
      const categoryData = {
        name: values.name,
        description: values.description || null,
        parentCategoryId: values.parentCategoryId === "none" ? null : values.parentCategoryId || null,
        colorCode: values.colorCode || null,
        iconName: values.iconName || null,
        sortOrder: values.sortOrder,
        isActive: true,
      };

      if (isEditing && categoryId) {
        await update(categoryId, categoryData);
        toast({
          title: "Category updated",
          description: "The category has been successfully updated.",
        });
      } else {
        await create(categoryData);
        toast({
          title: "Category created",
          description: "The category has been successfully created.",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} category. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Category" : "Add Category"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the details of this inventory category."
              : "Add a new category to organize your inventory items."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description"
                      {...field}
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No parent category</SelectItem>
                      {parentCategoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a parent category to create a subcategory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="colorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            {...field}
                            disabled={isLoading}
                            className="w-16 h-10 p-1 border rounded cursor-pointer"
                          />
                          <Input
                            placeholder="#000000"
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isLoading}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <div className="flex flex-wrap gap-1">
                        {CATEGORY_COLORS.slice(0, 12).map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 cursor-pointer"
                            onClick={() => field.onChange(color)}
                            title={`Select color ${color}`}
                            disabled={isLoading}
                            // eslint-disable-next-line react/forbid-dom-props -- Dynamic color picker requires inline styles
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_ICONS.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              <Palette className="h-4 w-4" />
                              {icon}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first in category lists
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-8">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Category" : "Create Category"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
