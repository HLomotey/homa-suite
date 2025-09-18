/**
 * Main complaints API module - exports all complaint-related functions
 * This replaces the monolithic api.ts file with modular components
 */

// Export all CRUD operations
export * from './crud';

// Export category and subcategory functions
export * from './categories';

// Export comment and attachment functions
export * from './comments-attachments';

// Export history tracking functions
export * from './history';

// Export routing and SLA functions
export * from './routing-sla';

// Export all complaint hooks (if they exist)
export * from './useComplaints';
export * from './useComplaintComments';
export * from './useComplaintAttachments';
export * from './useComplaintCategories';
export * from './useComplaintHistory';

// Note: Original api.ts is kept for backward compatibility but not re-exported here
// to avoid duplicate export conflicts. Components should migrate to use the modular imports above.
