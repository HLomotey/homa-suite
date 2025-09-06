import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  form_type: string;
  subject_template: string;
  body_template: string;
  variables: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const NotificationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    form_type: '',
    subject_template: '',
    body_template: '',
    variables: '',
    description: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Projection Created',
        form_type: 'projection',
        subject_template: 'New Projection: {{title}}',
        body_template: 'A new projection has been created.\n\nDetails:\n- Title: {{title}}\n- Location: {{location_description}}\n- Expected Revenue: ${{expected_revenue}}\n- Expected Hours: {{expected_hours}}\n- Status: {{status}}\n- Created: {{created_at}}\n\n{{custom_message}}\n\nPlease review this projection in the system.',
        variables: ['title', 'location_description', 'expected_revenue', 'expected_hours', 'status', 'created_at', 'custom_message'],
        description: 'Default template for single projection creation notifications',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Bulk Projections Created',
        form_type: 'bulk-projection',
        subject_template: 'Bulk Projections: {{count}} projections created',
        body_template: '{{count}} new projections have been created.\n\nSummary:\n- Number of Projections: {{count}}\n- Created: {{created_at}}\n\n{{projection_list}}\n\n{{custom_message}}\n\nPlease review these projections in the system.',
        variables: ['count', 'created_at', 'projection_list', 'custom_message'],
        description: 'Default template for bulk projection creation notifications',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    
    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      form_type: '',
      subject_template: '',
      body_template: '',
      variables: '',
      description: ''
    });
    setShowForm(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      form_type: template.form_type,
      subject_template: template.subject_template,
      body_template: template.body_template,
      variables: template.variables.join(', '),
      description: template.description || ''
    });
    setShowForm(true);
  };

  const handleSaveTemplate = () => {
    const templateData = {
      ...formData,
      variables: formData.variables.split(',').map(v => v.trim()).filter(v => v),
      is_active: true,
      created_at: new Date().toISOString()
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...templateData }
          : t
      ));
    } else {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...templateData
      };
      setTemplates(prev => [...prev, newTemplate]);
    }

    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString()
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const getFormTypeLabel = (formType: string) => {
    switch (formType) {
      case 'bulk-projection':
        return 'Bulk Projections';
      case 'projection':
        return 'Projection';
      case 'manual':
        return 'Manual';
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
            <CardTitle className="text-lg">Email Templates</CardTitle>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Templates Table */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFormTypeLabel(template.form_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {template.subject_template}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
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

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form_type">Form Type *</Label>
                  <Select 
                    value={formData.form_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, form_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projection">Projection</SelectItem>
                      <SelectItem value="bulk-projection">Bulk Projection</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="staff-benefit">Staff Benefit</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the template"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject_template">Subject Template *</Label>
                <Input
                  id="subject_template"
                  value={formData.subject_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                  placeholder="e.g., New {{form_type}}: {{title}}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body_template">Body Template *</Label>
                <Textarea
                  id="body_template"
                  value={formData.body_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, body_template: e.target.value }))}
                  placeholder="Email body with {{variables}} for dynamic content"
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variables">Variables (comma-separated)</Label>
                <Input
                  id="variables"
                  value={formData.variables}
                  onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                  placeholder="title, location, expected_revenue, custom_message"
                />
                <p className="text-xs text-muted-foreground">
                  List the variables used in your template (without curly braces)
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
