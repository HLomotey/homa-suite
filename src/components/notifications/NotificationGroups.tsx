import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { useEmailNotification } from '@/hooks/notification/useEmailNotification';

interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  form_types: string[];
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
  }>;
  is_active: boolean;
  created_at: string;
}

export const NotificationGroups: React.FC = () => {
  const { recipients, fetchRecipients } = useEmailNotification();
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<NotificationGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    form_types: [] as string[],
    recipient_ids: [] as string[]
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockGroups: NotificationGroup[] = [
      {
        id: '1',
        name: 'Finance Team',
        description: 'All finance department members',
        form_types: ['projection', 'bulk-projection', 'invoice', 'budget'],
        recipients: [
          { id: '1', name: 'Finance Manager', email: 'finance@company.com', role: 'Finance Manager' },
          { id: '2', name: 'Accountant', email: 'accountant@company.com', role: 'Accountant' }
        ],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Management Team',
        description: 'All managers and supervisors',
        form_types: ['projection', 'bulk-projection', 'staff-benefit', 'property'],
        recipients: [
          { id: '3', name: 'General Manager', email: 'gm@company.com', role: 'Manager' },
          { id: '4', name: 'Operations Manager', email: 'ops@company.com', role: 'Manager' }
        ],
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'System Administrators',
        description: 'System administrators and IT staff',
        form_types: ['user-management', 'system-config'],
        recipients: [
          { id: '5', name: 'IT Admin', email: 'admin@company.com', role: 'Admin' }
        ],
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    
    setTimeout(() => {
      setGroups(mockGroups);
      setLoading(false);
    }, 1000);
    
    fetchRecipients();
  }, [fetchRecipients]);

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      form_types: [],
      recipient_ids: []
    });
    setShowForm(true);
  };

  const handleEditGroup = (group: NotificationGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      form_types: group.form_types,
      recipient_ids: group.recipients.map(r => r.id)
    });
    setShowForm(true);
  };

  const handleSaveGroup = () => {
    const selectedRecipients = recipients.filter(r => formData.recipient_ids.includes(r.id));
    
    const groupData = {
      name: formData.name,
      description: formData.description,
      form_types: formData.form_types,
      recipients: selectedRecipients,
      is_active: true,
      created_at: new Date().toISOString()
    };

    if (editingGroup) {
      setGroups(prev => prev.map(g => 
        g.id === editingGroup.id 
          ? { ...g, ...groupData }
          : g
      ));
    } else {
      const newGroup: NotificationGroup = {
        id: Date.now().toString(),
        ...groupData
      };
      setGroups(prev => [...prev, newGroup]);
    }

    setShowForm(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleFormTypeChange = (formType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      form_types: checked 
        ? [...prev.form_types, formType]
        : prev.form_types.filter(ft => ft !== formType)
    }));
  };

  const handleRecipientChange = (recipientId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recipient_ids: checked 
        ? [...prev.recipient_ids, recipientId]
        : prev.recipient_ids.filter(id => id !== recipientId)
    }));
  };

  const getFormTypeLabel = (formType: string) => {
    switch (formType) {
      case 'bulk-projection':
        return 'Bulk Projections';
      case 'projection':
        return 'Projection';
      case 'staff-benefit':
        return 'Staff Benefit';
      case 'property':
        return 'Property';
      case 'invoice':
        return 'Invoice';
      case 'budget':
        return 'Budget';
      case 'user-management':
        return 'User Management';
      case 'system-config':
        return 'System Config';
      default:
        return formType;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notification Groups</CardTitle>
            <Button onClick={handleCreateGroup}>
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Groups Table */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Form Types</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {group.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {group.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {group.form_types.slice(0, 2).map((formType, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getFormTypeLabel(formType)}
                          </Badge>
                        ))}
                        {group.form_types.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.form_types.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <span>{group.recipients.length} members</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.is_active ? "default" : "secondary"}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Group Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the group"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Form Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'projection',
                    'bulk-projection',
                    'staff-benefit',
                    'property',
                    'invoice',
                    'budget',
                    'user-management',
                    'system-config'
                  ].map((formType) => (
                    <div key={formType} className="flex items-center space-x-2">
                      <Checkbox
                        id={formType}
                        checked={formData.form_types.includes(formType)}
                        onCheckedChange={(checked) => handleFormTypeChange(formType, !!checked)}
                      />
                      <Label htmlFor={formType} className="text-sm">
                        {getFormTypeLabel(formType)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Group Members</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {recipients.map((recipient) => (
                      <div key={recipient.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={recipient.id}
                          checked={formData.recipient_ids.includes(recipient.id)}
                          onCheckedChange={(checked) => handleRecipientChange(recipient.id, !!checked)}
                        />
                        <Label htmlFor={recipient.id} className="text-sm flex-1">
                          <div className="flex items-center justify-between">
                            <span>{recipient.name}</span>
                            <span className="text-xs text-muted-foreground">{recipient.email}</span>
                          </div>
                          {recipient.role && (
                            <div className="text-xs text-muted-foreground">{recipient.role}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGroup}>
                {editingGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
