// Supabase client and type exports
// This file provides a centralized export for Supabase client and common types

export { supabase } from './supabaseClient';

// Re-export common types from integration layer
export type {
  User,
  Profile,
  UserRole,
  UserStatus,
  Database
} from '../integration/supabase/types';

// Re-export termination types from hook
export type {
  TerminationRequest,
  CreateTerminationData,
  ExternalStaff
} from '../hooks/useTermination';

// Re-export termination enums from lib
export type {
  TerminationStatus,
  SeparationType,
  TerminationReason,
  RehireEligibility,
  DirectDepositAction
} from './termination';
