export interface CompanyAccount {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyAccountFormData {
  name: string;
}

export interface CreateCompanyAccountRequest {
  name: string;
}

export interface UpdateCompanyAccountRequest {
  id: number;
  name: string;
}
