export interface ComplaintCategory {
  id: string;
  name: string;
  asset_type: 'property' | 'hotel' | 'vehicle';
  description: string | null;
  sla_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface FrontendComplaintCategory {
  id: string;
  name: string;
  assetType: 'property' | 'hotel' | 'vehicle';
  description: string | null;
  slaHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ComplaintCategoryFormData {
  name: string;
  assetType: 'property' | 'hotel' | 'vehicle';
  description?: string;
  slaHours?: number;
  isActive?: boolean;
}
