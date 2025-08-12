import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2, RefreshCw } from 'lucide-react';

interface UserFormActionsProps {
  isNewUser: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  onCancel: () => void;
  canDelete?: boolean;
}

export const UserFormActions: React.FC<UserFormActionsProps> = ({
  isNewUser,
  isSubmitting,
  onSubmit,
  onDelete,
  onCancel,
  canDelete = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isSubmitting}
        className="text-white/80 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      <div className="flex items-center space-x-2">
        {!isNewUser && canDelete && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        )}
        
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
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
