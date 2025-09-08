import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2, RefreshCw, Mail } from 'lucide-react';

interface UserFormActionsProps {
  isNewUser: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  onCancel: () => void;
  onPasswordReset?: () => void;
  canDelete?: boolean;
  isResettingPassword?: boolean;
}

export const UserFormActions: React.FC<UserFormActionsProps> = ({
  isNewUser,
  isSubmitting,
  onSubmit,
  onDelete,
  onCancel,
  onPasswordReset,
  canDelete = false,
  isResettingPassword = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isSubmitting || isResettingPassword}
        className="text-white/80 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      <div className="flex items-center space-x-2">
        {!isNewUser && onPasswordReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onPasswordReset}
            disabled={isSubmitting || isResettingPassword}
            className="bg-black/20 border-white/10 text-white hover:bg-white/10"
          >
            {isResettingPassword ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Password Reset
              </>
            )}
          </Button>
        )}
        
        
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting || isResettingPassword}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {isNewUser ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isNewUser ? 'Create User' : 'Update User'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
