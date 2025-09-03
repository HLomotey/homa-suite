# Complaints API Modules

This directory contains the modularized complaints API, broken down from the original 800+ line `api.ts` file into smaller, maintainable modules.

## Module Structure

### Core Modules

- **`crud.ts`** - Main CRUD operations for complaints
  - `getComplaints()` - Fetch complaints with filtering and pagination
  - `getComplaintById()` - Get single complaint by ID
  - `createComplaint()` - Create new complaint
  - `updateComplaint()` - Update existing complaint
  - `deleteComplaint()` - Delete complaint and related records

- **`categories.ts`** - Category and subcategory management
  - `getComplaintCategories()` - Fetch complaint categories
  - `getComplaintSubcategories()` - Fetch subcategories
  - `getCategoriesWithSubcategories()` - Get categories with nested subcategories

- **`comments-attachments.ts`** - Comments and file attachments
  - `getComplaintComments()` - Fetch comments for a complaint
  - `addComplaintComment()` - Add new comment
  - `getComplaintAttachments()` - Fetch attachments
  - `uploadComplaintAttachment()` - Upload file attachment

- **`history.ts`** - Activity tracking and history
  - `getComplaintHistory()` - Get complaint activity history
  - `addComplaintHistoryEntry()` - Add history entry
  - `getComplaintActivitySummary()` - Get activity statistics

- **`routing-sla.ts`** - Auto-routing and SLA management
  - `getComplaintRoutingRules()` - Fetch routing rules
  - `getComplaintSLAs()` - Get SLA configurations
  - `findRoutingRule()` - Find best routing rule for complaint
  - `calculateDueDate()` - Calculate SLA due dates

### Main Export

- **`index.ts`** - Main module that exports all functions from the sub-modules

## Migration Guide

### Before (Monolithic)
```typescript
import { getComplaints, createComplaint } from '@/hooks/complaints/api';
```

### After (Modular)
```typescript
// Option 1: Import from main index (recommended)
import { getComplaints, createComplaint } from '@/hooks/complaints';

// Option 2: Import from specific modules
import { getComplaints, createComplaint } from '@/hooks/complaints/crud';
import { getComplaintCategories } from '@/hooks/complaints/categories';
```

## Benefits

1. **Maintainability** - Each module focuses on a specific domain
2. **Reusability** - Functions can be imported individually
3. **Testing** - Easier to unit test smaller modules
4. **Performance** - Tree-shaking can eliminate unused code
5. **Collaboration** - Multiple developers can work on different modules

## Backward Compatibility

The original `api.ts` file is preserved for backward compatibility during migration. Components should gradually migrate to use the new modular imports.

## Type Safety

All modules use strict TypeScript typing with proper error handling and return types consistent with the original API.
