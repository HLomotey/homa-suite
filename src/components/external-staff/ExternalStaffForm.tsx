import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  DollarSign,
  Users,
  Shield,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { 
  CreateExternalStaff, 
  FrontendExternalStaff,
  EMPLOYMENT_STATUS_OPTIONS,
  PAY_FREQUENCY_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS
} from '../../integration/supabase/types/external-staff';
import { useCreateExternalStaff, useUpdateExternalStaff } from '../../hooks/external-staff/useExternalStaff';

// Form validation schema
const externalStaffSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional(),
  e_mail: z.string().email('Invalid email format').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  phone_n: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  marital_status: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employment_status: z.string().optional(),
  hire_date: z.string().optional(),
  termination_date: z.string().optional(),
  supervisor: z.string().optional(),
  work_location: z.string().optional(),
  salary: z.string().optional(),
  hourly_rate: z.string().optional(),
  pay_frequency: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  ethnicity_race: z.string().optional(),
  veteran_status: z.string().optional(),
  disability_status: z.string().optional(),
  external_staff_id: z.string().optional(),
});

type FormData = z.infer<typeof externalStaffSchema>;

interface ExternalStaffFormProps {
  staff?: FrontendExternalStaff;
  onSuccess?: (staff: FrontendExternalStaff) => void;
  onCancel?: () => void;
}

export const ExternalStaffForm: React.FC<ExternalStaffFormProps> = ({
  staff,
  onSuccess,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  const isEditing = Boolean(staff);

  const { create, loading: createLoading, error: createError } = useCreateExternalStaff();
  const { update, loading: updateLoading, error: updateError } = useUpdateExternalStaff();

  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(externalStaffSchema),
    defaultValues: staff ? {
      first_name: staff.firstName || '',
      last_name: staff.lastName || '',
      middle_name: staff.middleName || '',
      e_mail: staff.eMail || '',
      date_of_birth: staff.dateOfBirth || '',
      phone_n: staff.phoneN || '',
      address: staff.address || '',
      city: staff.city || '',
      state: staff.state || '',
      zip_code: staff.zipCode || '',
      country: staff.country || '',
      gender: staff.gender || '',
      marital_status: staff.maritalStatus || '',
      department: staff.department || '',
      position: staff.position || '',
      employment_status: staff.employmentStatus || '',
      hire_date: staff.hireDate || '',
      termination_date: staff.terminationDate || '',
      supervisor: staff.supervisor || '',
      work_location: staff.workLocation || '',
      salary: staff.salary?.toString() || '',
      hourly_rate: staff.hourlyRate?.toString() || '',
      pay_frequency: staff.payFrequency || '',
      emergency_contact_name: staff.emergencyContactName || '',
      emergency_contact_phone: staff.emergencyContactPhone || '',
      emergency_contact_relationship: staff.emergencyContactRelationship || '',
      ethnicity_race: staff.ethnicityRace || '',
      veteran_status: staff.veteranStatus || '',
      disability_status: staff.disabilityStatus || '',
      external_staff_id: staff.externalStaffId || '',
    } : {}
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Convert form data to CreateExternalStaff format
      const staffData: CreateExternalStaff = {
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        middle_name: data.middle_name || undefined,
        e_mail: data.e_mail || undefined,
        date_of_birth: data.date_of_birth || undefined,
        phone_n: data.phone_n || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip_code: data.zip_code || undefined,
        country: data.country || undefined,
        gender: data.gender || undefined,
        marital_status: data.marital_status || undefined,
        department: data.department || undefined,
        position: data.position || undefined,
        employment_status: data.employment_status || undefined,
        hire_date: data.hire_date || undefined,
        termination_date: data.termination_date || undefined,
        supervisor: data.supervisor || undefined,
        work_location: data.work_location || undefined,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : undefined,
        pay_frequency: data.pay_frequency || undefined,
        emergency_contact_name: data.emergency_contact_name || undefined,
        emergency_contact_phone: data.emergency_contact_phone || undefined,
        emergency_contact_relationship: data.emergency_contact_relationship || undefined,
        ethnicity_race: data.ethnicity_race || undefined,
        veteran_status: data.veteran_status || undefined,
        disability_status: data.disability_status || undefined,
        external_staff_id: data.external_staff_id || undefined,
      };

      let result;
      if (isEditing && staff) {
        result = await update({ id: staff.id, ...staffData });
      } else {
        result = await create(staffData);
      }

      if (result) {
        onSuccess?.(result);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'emergency', label: 'Emergency Contact', icon: Phone },
    { id: 'demographics', label: 'Demographics', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Edit External Staff' : 'Add External Staff'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update external staff information' : 'Create a new external staff record'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        {activeTab === 'personal' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    {...register('middle_name')}
                    placeholder="Enter middle name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register('date_of_birth')}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Select onValueChange={(value) => setValue('marital_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARITAL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="external_staff_id">External Staff ID</Label>
                <Input
                  id="external_staff_id"
                  {...register('external_staff_id')}
                  placeholder="Enter external system staff ID"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {activeTab === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Email, phone, and address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="e_mail">Email</Label>
                  <Input
                    id="e_mail"
                    type="email"
                    {...register('e_mail')}
                    placeholder="Enter email address"
                  />
                  {errors.e_mail && (
                    <p className="text-sm text-red-600 mt-1">{errors.e_mail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone_n">Phone Number</Label>
                  <Input
                    id="phone_n"
                    {...register('phone_n')}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    {...register('zip_code')}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register('country')}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employment Information */}
        {activeTab === 'employment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment Information
              </CardTitle>
              <CardDescription>Job details and employment status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...register('department')}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    {...register('position')}
                    placeholder="Enter job position"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employment_status">Employment Status</Label>
                  <Select onValueChange={(value) => setValue('employment_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    {...register('supervisor')}
                    placeholder="Enter supervisor name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    {...register('hire_date')}
                  />
                </div>
                <div>
                  <Label htmlFor="termination_date">Termination Date</Label>
                  <Input
                    id="termination_date"
                    type="date"
                    {...register('termination_date')}
                  />
                </div>
                <div>
                  <Label htmlFor="work_location">Work Location</Label>
                  <Input
                    id="work_location"
                    {...register('work_location')}
                    placeholder="Enter work location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compensation */}
        {activeTab === 'compensation' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compensation
              </CardTitle>
              <CardDescription>Salary and payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary">Annual Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    {...register('salary')}
                    placeholder="Enter annual salary"
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    {...register('hourly_rate')}
                    placeholder="Enter hourly rate"
                  />
                </div>
                <div>
                  <Label htmlFor="pay_frequency">Pay Frequency</Label>
                  <Select onValueChange={(value) => setValue('pay_frequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAY_FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {activeTab === 'emergency' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    {...register('emergency_contact_name')}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    {...register('emergency_contact_phone')}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                  <Input
                    id="emergency_contact_relationship"
                    {...register('emergency_contact_relationship')}
                    placeholder="Enter relationship (e.g., Spouse, Parent)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demographics */}
        {activeTab === 'demographics' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demographics
              </CardTitle>
              <CardDescription>Optional demographic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ethnicity_race">Ethnicity/Race</Label>
                  <Input
                    id="ethnicity_race"
                    {...register('ethnicity_race')}
                    placeholder="Enter ethnicity/race"
                  />
                </div>
                <div>
                  <Label htmlFor="veteran_status">Veteran Status</Label>
                  <Select onValueChange={(value) => setValue('veteran_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select veteran status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="disability_status">Disability Status</Label>
                  <Select onValueChange={(value) => setValue('disability_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disability status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};
