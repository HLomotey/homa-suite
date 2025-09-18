/**
 * CategoryList component
 * Displays and manages inventory categories with hierarchical structure
 */

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Package
} from "lucide-react";
import { FrontendInventoryCategory } from "../../integration/supabase/types/inventory";
import { Skeleton } from "../ui/skeleton";
import { useInventoryCategoryManager } from "../../hooks/inventory/useInventoryCategories";
import { useToast } from "../ui/use-toast";

interface CategoryListProps {
  onAddCategory: () => void;
  onEditCategory: (categoryId: string) => void;
}

interface CategoryWithChildren extends FrontendInventoryCategory {
  children: CategoryWithChildren[];
  itemCount?: number;
}

export function CategoryList({
  onAddCategory,
  onEditCategory,
}: CategoryListProps) {
  // All hooks must be called before any conditional returns
  const { toast } = useToast();
  const { 
    categories, 
    loading, 
    error, 
    delete: deleteCategory 
  } = useInventoryCategoryManager();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build hierarchical category structure
  const hierarchicalCategories = useMemo(() => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create all category objects
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      if (category.parentCategoryId) {
        const parent = categoryMap.get(category.parentCategoryId);
        if (parent) {
          parent.children.push(categoryWithChildren);
        } else {
          rootCategories.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }, [categories]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return hierarchicalCategories;
    
    const filterCategory = (category: CategoryWithChildren): CategoryWithChildren | null => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const filteredChildren = category.children
        .map(child => filterCategory(child))
        .filter(Boolean) as CategoryWithChildren[];
      
      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...category,
          children: filteredChildren,
        };
      }
      
      return null;
    };
    
    return hierarchicalCategories
      .map(category => filterCategory(category))
      .filter(Boolean) as CategoryWithChildren[];
  }, [hierarchicalCategories, searchQuery]);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryRow = (category: CategoryWithChildren, level: number = 0): React.ReactNode => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const paddingLeft = level * 24;

    return (
      <TableRow key={category.id}>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(category.id)}
                className="p-0 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            <div 
              className="w-4 h-4 rounded border bg-gray-400"
              {...(category.colorCode && { style: { backgroundColor: category.colorCode } })}
            />
            <span className="font-medium">{category.name}</span>
          </div>
        </TableCell>
        <TableCell>{category.description || "—"}</TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary">{category.itemCount || 0}</Badge>
        </TableCell>
        <TableCell className="text-center">{category.sortOrder}</TableCell>
        <TableCell>
          <Badge variant={category.isActive ? "default" : "secondary"}>
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEditCategory(category.id)}
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteCategory(category.id)}
              title="Delete category"
              disabled={category.itemCount && category.itemCount > 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Conditional rendering after all hooks
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Organize your inventory with custom categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Error loading categories: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Categories</CardTitle>
            <CardDescription>
              Manage categories to organize your inventory items
            </CardDescription>
          </div>
          <Button onClick={onAddCategory} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-center">Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-8 w-8" />
                      <p>
                        {searchQuery
                          ? "No categories match your search criteria"
                          : "No categories found. Add your first category!"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map(category => renderCategoryRow(category))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filteredCategories.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCategories.length} categories
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
