import { z } from "zod";

// Action item schema
export const actionItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  owner: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(["open", "in_progress", "done"]).default("open")
});

// Group schema
export const groupSchema = z.object({
  id: z.string().optional(),
  group_name: z.string().min(1, "Group name is required"),
  arrival_date: z.string().min(1, "Arrival date is required"),
  departure_date: z.string().min(1, "Departure date is required"),
  rooms_blocked: z.number().min(0, "Rooms blocked must be 0 or greater").int(),
  notes: z.string().optional()
}).refine((data) => {
  if (data.arrival_date && data.departure_date) {
    return new Date(data.departure_date) >= new Date(data.arrival_date);
  }
  return true;
}, {
  message: "Departure date must be on or after arrival date",
  path: ["departure_date"]
});

// Main month-end report schema
export const monthEndReportSchema = z.object({
  // Meta information
  id: z.string().optional(),
  property_id: z.string().optional(),
  property_name: z.string().min(1, "Property name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  
  // Summary tab
  headline: z.string()
    .min(10, "Headline must be at least 10 characters")
    .max(120, "Headline must be no more than 120 characters"),
  narrative: z.string()
    .min(50, "Narrative must be at least 50 characters")
    .max(3000, "Narrative must be no more than 3000 characters"),
  key_risks: z.array(z.string()).default([]),
  key_wins: z.array(z.string()).default([]),
  
  // Hotel Occupancy tab
  occupancy_start_pct: z.number()
    .min(0, "Occupancy must be between 0 and 100")
    .max(100, "Occupancy must be between 0 and 100")
    .optional(),
  occupancy_end_pct: z.number()
    .min(0, "Occupancy must be between 0 and 100")
    .max(100, "Occupancy must be between 0 and 100")
    .optional(),
  avg_occupancy_pct: z.number()
    .min(0, "Occupancy must be between 0 and 100")
    .max(100, "Occupancy must be between 0 and 100")
    .optional(),
  occupancy_notes: z.string().optional(),
  
  // Guest Room Cleanliness tab
  cleanliness_score: z.number()
    .min(0, "Cleanliness score must be between 0 and 1")
    .max(1, "Cleanliness score must be between 0 and 1")
    .optional(),
  inspection_count: z.number()
    .min(0, "Inspection count must be 0 or greater")
    .int()
    .optional(),
  issues_found: z.number()
    .min(0, "Issues found must be 0 or greater")
    .int()
    .optional(),
  cleanliness_comments: z.string().optional(),
  
  // Staffing & Notes tab
  training_updates: z.string().optional(),
  absenteeism_notes: z.string().optional(),
  incidents: z.string().optional(),
  
  // Dynamic lists
  groups: z.array(groupSchema).default([]),
  action_items: z.array(actionItemSchema).default([])
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "End date must be on or after start date",
  path: ["end_date"]
});

export type MonthEndReportFormData = z.infer<typeof monthEndReportSchema>;
export type GroupFormData = z.infer<typeof groupSchema>;
export type ActionItemFormData = z.infer<typeof actionItemSchema>;
