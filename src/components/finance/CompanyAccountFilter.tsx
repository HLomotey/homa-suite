import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface CompanyAccount {
  id: number;
  name: string;
}

interface CompanyAccountFilterProps {
  companyAccounts: CompanyAccount[];
  selectedAccountId: number | null;
  onAccountChange: (accountId: number | null) => void;
  loading?: boolean;
}

export function CompanyAccountFilter({
  companyAccounts,
  selectedAccountId,
  onAccountChange,
  loading = false
}: CompanyAccountFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="company-account-select">Company Account</Label>
      <Select
        value={selectedAccountId?.toString() || "all"}
        onValueChange={(value) => {
          if (value === "all") {
            onAccountChange(null);
          } else {
            onAccountChange(parseInt(value));
          }
        }}
        disabled={loading}
      >
        <SelectTrigger id="company-account-select" className="w-full">
          <SelectValue placeholder="Select company account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Companies</SelectItem>
          {companyAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
