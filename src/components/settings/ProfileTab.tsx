"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Camera, User, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  bio: string;
  avatar: string;
}

export function ProfileTab() {
  const { toast } = useToast();
  
  // Mock user profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 123-4567",
    jobTitle: "Operations Manager",
    department: "Operations",
    location: "New York, NY",
    bio: "Experienced operations manager with a focus on process optimization and team leadership.",
    avatar: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  const handleUpdateProfile = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1500);
  };
  
  const handleAvatarUpload = () => {
    // In a real app, this would open a file picker
    toast({
      title: "Upload Avatar",
      description: "Avatar upload functionality will be implemented in a future update.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white">User Profile</CardTitle>
          <CardDescription className="text-white/60">
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-2 border-white/10">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-900 to-purple-900 text-3xl">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarUpload}
                  className="bg-black/40 border-white/10 text-white hover:bg-white/10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-black/40 border-white/10 text-white hover:bg-white/10"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
            
            {/* Profile tabs */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-black/40 border border-white/10 mb-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="work">Work Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                          className="bg-black/40 border-white/10 text-white pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                          className="bg-black/40 border-white/10 text-white pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className="bg-black/40 border-white/10 text-white pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="bg-black/40 border-white/10 text-white pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-white">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        rows={4}
                        className="bg-black/40 border-white/10 text-white resize-none"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="work">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                          id="jobTitle"
                          value={profile.jobTitle}
                          onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                          className="bg-black/40 border-white/10 text-white pl-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-white">Department</Label>
                      <div className="relative">
                        <Building className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Select 
                          value={profile.department}
                          onValueChange={(value) => setProfile({...profile, department: value})}
                        >
                          <SelectTrigger className="bg-black/40 border-white/10 text-white pl-8">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                          className="bg-black/40 border-white/10 text-white pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateProfile} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
