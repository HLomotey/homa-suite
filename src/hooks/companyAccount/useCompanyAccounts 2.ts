import { useState, useEffect } from 'react';
import { supabase } from '@/integration/supabase/client';
import { CompanyAccount, CreateCompanyAccountRequest, UpdateCompanyAccountRequest } from '@/types/companyAccount';

export const useCompanyAccounts = () => {
  const [companyAccounts, setCompanyAccounts] = useState<CompanyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await (supabase as any)
        .from('company_accounts')
        .select('*')
        .order('name');

      if (error) throw error;

      setCompanyAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company accounts');
    } finally {
      setLoading(false);
    }
  };

  const createCompanyAccount = async (accountData: CreateCompanyAccountRequest): Promise<CompanyAccount | null> => {
    try {
      setError(null);
      
      const { data, error } = await (supabase as any)
        .from('company_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCompanyAccounts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company account');
      return null;
    }
  };

  const updateCompanyAccount = async (accountData: UpdateCompanyAccountRequest): Promise<CompanyAccount | null> => {
    try {
      setError(null);
      
      const { data, error } = await (supabase as any)
        .from('company_accounts')
        .update({ name: accountData.name })
        .eq('id', accountData.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCompanyAccounts(prev => 
          prev.map(account => account.id === data.id ? data : account)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company account');
      return null;
    }
  };

  const deleteCompanyAccount = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      
      const { error } = await (supabase as any)
        .from('company_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanyAccounts(prev => prev.filter(account => account.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company account');
      return false;
    }
  };

  useEffect(() => {
    fetchCompanyAccounts();
  }, []);

  return {
    companyAccounts,
    loading,
    error,
    fetchCompanyAccounts,
    createCompanyAccount,
    updateCompanyAccount,
    deleteCompanyAccount
  };
};
