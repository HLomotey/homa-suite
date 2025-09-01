import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MonthEndReportProvider,
  useMonthEndReportContext,
} from "../context/MonthEndReportContext";
import { GlobalReportHeader } from "../components/shared/GlobalReportHeader";
import { ContextualFormSheet } from "../components/shared/ContextualFormSheet";
import { Plus, BarChart3, Sparkles, Users, Target } from "lucide-react";

// Individual form components that use shared context
const OccupancyForm: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  const [formData, setFormData] = useState({
    avg_occupancy_pct: "",
    occupancy_notes: "",
  });

  return (
    <ContextualFormSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Add Occupancy Data"
      formData={formData}
      onSave={(data) => {
        console.log("Saving occupancy data:", data);
        onOpenChange(false);
      }}
      onCancel={() => onOpenChange(false)}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="avg_occupancy_pct">Average Occupancy %</Label>
          <Input
            id="avg_occupancy_pct"
            type="number"
            placeholder="85"
            value={formData.avg_occupancy_pct}
            onChange={(e) =>
              setFormData({ ...formData, avg_occupancy_pct: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="occupancy_notes">Notes</Label>
          <Textarea
            id="occupancy_notes"
            placeholder="Add occupancy insights..."
            value={formData.occupancy_notes}
            onChange={(e) =>
              setFormData({ ...formData, occupancy_notes: e.target.value })
            }
            rows={3}
          />
        </div>
      </div>
    </ContextualFormSheet>
  );
};

const CleanlinessForm: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  const [formData, setFormData] = useState({
    cleanliness_score: "",
    cleanliness_comments: "",
  });

  return (
    <ContextualFormSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Add Cleanliness Data"
      formData={formData}
      onSave={(data) => {
        console.log("Saving cleanliness data:", data);
        onOpenChange(false);
      }}
      onCancel={() => onOpenChange(false)}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="cleanliness_score">Cleanliness Score (1-10)</Label>
          <Input
            id="cleanliness_score"
            type="number"
            min="1"
            max="10"
            placeholder="8.5"
            value={formData.cleanliness_score}
            onChange={(e) =>
              setFormData({ ...formData, cleanliness_score: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="cleanliness_comments">Comments</Label>
          <Textarea
            id="cleanliness_comments"
            placeholder="Add cleanliness insights..."
            value={formData.cleanliness_comments}
            onChange={(e) =>
              setFormData({ ...formData, cleanliness_comments: e.target.value })
            }
            rows={3}
          />
        </div>
      </div>
    </ContextualFormSheet>
  );
};

const DemoContent: React.FC = () => {
  const { isContextComplete } = useMonthEndReportContext();
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const keyIndicators = [
    {
      id: "occupancy",
      label: "Occupancy",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "cleanliness",
      label: "Cleanliness",
      icon: Sparkles,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "groups",
      label: "Groups",
      icon: Users,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "staffing",
      label: "Staffing",
      icon: Target,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  return (
    <div className="space-y-6">
      <GlobalReportHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyIndicators.map((indicator) => {
          const IconComponent = indicator.icon;
          return (
            <Card key={indicator.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconComponent className="h-4 w-4" />
                  {indicator.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setActiveForm(indicator.id)}
                  disabled={!isContextComplete}
                  className="w-full"
                  variant={isContextComplete ? "default" : "outline"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data
                </Button>
                {!isContextComplete && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Configure hotel site & dates first
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefit Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            ✨ Shared Context Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                Reduced Fatigue
              </Badge>
              <span className="text-gray-600">Set hotel site & dates once</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                Data Consistency
              </Badge>
              <span className="text-gray-600">
                Same context across all forms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">Better UX</Badge>
              <span className="text-gray-600">Focus on key metrics only</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Sheets */}
      <OccupancyForm
        isOpen={activeForm === "occupancy"}
        onOpenChange={(open) => setActiveForm(open ? "occupancy" : null)}
      />
      <CleanlinessForm
        isOpen={activeForm === "cleanliness"}
        onOpenChange={(open) => setActiveForm(open ? "cleanliness" : null)}
      />
    </div>
  );
};

export const SharedContextDemo: React.FC = () => {
  return (
    <MonthEndReportProvider>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Operations Call Meeting Report - Shared Context Demo
          </h1>
          <p className="text-gray-600">
            This demo shows how shared context eliminates repetitive hotel site
            and date selection across key indicator forms.
          </p>
        </div>

        <DemoContent />
      </div>
    </MonthEndReportProvider>
  );
};
