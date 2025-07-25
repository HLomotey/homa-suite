"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Clock, Calendar, AlertCircle, CheckCircle, DollarSign, FileText, BarChart2, Info } from "lucide-react";

interface NotificationSetting {
  id: string;
  type: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  icon: React.ReactNode;
}

interface NotificationSchedule {
  frequency: "realtime" | "daily" | "weekly";
  days: string[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export function NotificationsTab() {
  const { toast } = useToast();
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: "transactions",
      type: "Transactions",
      description: "Notifications for deposits, withdrawals, and transfers",
      email: true,
      push: true,
      sms: false,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      id: "investments",
      type: "Investments",
      description: "Updates on investment performance and opportunities",
      email: true,
      push: true,
      sms: false,
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      id: "statements",
      type: "Statements",
      description: "New statement availability notifications",
      email: true,
      push: false,
      sms: false,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "security",
      type: "Security Alerts",
      description: "Important security notifications and alerts",
      email: true,
      push: true,
      sms: true,
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      id: "updates",
      type: "System Updates",
      description: "System maintenance and feature updates",
      email: true,
      push: false,
      sms: false,
      icon: <Info className="h-4 w-4" />,
    },
  ]);
  
  // Schedule settings state
  const [schedule, setSchedule] = useState<NotificationSchedule>({
    frequency: "realtime",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });
  
  // Toggle notification channel
  const toggleNotificationChannel = (id: string, channel: "email" | "push" | "sms") => {
    setNotificationSettings(
      notificationSettings.map((setting) => {
        if (setting.id === id) {
          return { ...setting, [channel]: !setting[channel] };
        }
        return setting;
      })
    );
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  // Toggle quiet hours
  const toggleQuietHours = () => {
    setSchedule({
      ...schedule,
      quietHoursEnabled: !schedule.quietHoursEnabled,
    });
  };
  
  // Toggle day selection
  const toggleDay = (day: string) => {
    if (schedule.days.includes(day)) {
      setSchedule({
        ...schedule,
        days: schedule.days.filter((d) => d !== day),
      });
    } else {
      setSchedule({
        ...schedule,
        days: [...schedule.days, day],
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="mb-4 bg-black/40 border border-white/10">
          <TabsTrigger value="preferences">Notification Preferences</TabsTrigger>
          <TabsTrigger value="schedule">Delivery Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-white/60">
                Choose which notifications you want to receive and how
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 pb-2 border-b border-white/10">
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-white/80">Notification Type</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-white/80">Email</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-white/80">Push</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-white/80">SMS</span>
                  </div>
                </div>
                
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-4 gap-4 items-center">
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-black/40 p-1.5 rounded-md">
                          {setting.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{setting.type}</p>
                          <p className="text-xs text-white/60">{setting.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={setting.email}
                        onCheckedChange={() => toggleNotificationChannel(setting.id, "email")}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={setting.push}
                        onCheckedChange={() => toggleNotificationChannel(setting.id, "push")}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={setting.sms}
                        onCheckedChange={() => toggleNotificationChannel(setting.id, "sms")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Notification Schedule</CardTitle>
              <CardDescription className="text-white/60">
                Configure when and how often you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frequency" className="text-white">Notification Frequency</Label>
                  <Select 
                    value={schedule.frequency}
                    onValueChange={(value: "realtime" | "daily" | "weekly") => 
                      setSchedule({...schedule, frequency: value})
                    }
                  >
                    <SelectTrigger id="frequency" className="bg-black/40 border-white/10 text-white mt-1.5">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      <SelectItem value="realtime">Real-time (As they happen)</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {schedule.frequency !== "realtime" && (
                  <div className="space-y-3">
                    <Label className="text-white">Delivery Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox 
                            id={day} 
                            checked={schedule.days.includes(day)}
                            onCheckedChange={() => toggleDay(day)}
                          />
                          <Label 
                            htmlFor={day} 
                            className="text-white capitalize cursor-pointer"
                          >
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Quiet Hours</h4>
                      <p className="text-xs text-white/60">Pause notifications during specific hours</p>
                    </div>
                    <Switch
                      checked={schedule.quietHoursEnabled}
                      onCheckedChange={toggleQuietHours}
                    />
                  </div>
                  
                  {schedule.quietHoursEnabled && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quietStart" className="text-white">Start Time</Label>
                        <input
                          id="quietStart"
                          type="time"
                          value={schedule.quietHoursStart}
                          onChange={(e) => setSchedule({...schedule, quietHoursStart: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quietEnd" className="text-white">End Time</Label>
                        <input
                          id="quietEnd"
                          type="time"
                          value={schedule.quietHoursEnd}
                          onChange={(e) => setSchedule({...schedule, quietHoursEnd: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Schedule</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
