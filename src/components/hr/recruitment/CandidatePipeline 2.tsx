import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ChevronRight } from "lucide-react";

interface CandidatePipelineProps {
  timeRange: string;
  department: string;
}

// Mock candidate data
const candidates = [
  {
    id: 1,
    name: "John Smith",
    position: "Senior Software Engineer",
    department: "Engineering",
    stage: "Interview",
    status: "Active",
    appliedDate: "2025-07-10",
    lastActivity: "2025-07-22"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Marketing Manager",
    department: "Marketing",
    stage: "Offer",
    status: "Active",
    appliedDate: "2025-07-08",
    lastActivity: "2025-07-24"
  },
  {
    id: 3,
    name: "Michael Chen",
    position: "Financial Analyst",
    department: "Finance",
    stage: "Screening",
    status: "Active",
    appliedDate: "2025-07-15",
    lastActivity: "2025-07-20"
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "Product Manager",
    department: "Engineering",
    stage: "Interview",
    status: "Active",
    appliedDate: "2025-07-12",
    lastActivity: "2025-07-23"
  },
  {
    id: 5,
    name: "Robert Wilson",
    position: "Sales Representative",
    department: "Sales",
    stage: "Application",
    status: "New",
    appliedDate: "2025-07-20",
    lastActivity: "2025-07-20"
  },
  {
    id: 6,
    name: "Lisa Brown",
    position: "HR Specialist",
    department: "HR",
    stage: "Assessment",
    status: "Active",
    appliedDate: "2025-07-14",
    lastActivity: "2025-07-21"
  },
  {
    id: 7,
    name: "David Williams",
    position: "Support Engineer",
    department: "Support",
    stage: "Interview",
    status: "Active",
    appliedDate: "2025-07-11",
    lastActivity: "2025-07-22"
  }
];

export function CandidatePipeline({ timeRange, department }: CandidatePipelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<typeof candidates[0] | null>(null);
  
  // Filter candidates based on search query, department, and stage
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = department === "all" || candidate.department.toLowerCase() === department.toLowerCase();
    const matchesStage = stageFilter === "all" || candidate.stage.toLowerCase() === stageFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStage;
  });
  
  // Get stage counts
  const stageCounts = {
    application: candidates.filter(c => c.stage === "Application").length,
    screening: candidates.filter(c => c.stage === "Screening").length,
    assessment: candidates.filter(c => c.stage === "Assessment").length,
    interview: candidates.filter(c => c.stage === "Interview").length,
    offer: candidates.filter(c => c.stage === "Offer").length,
    hired: candidates.filter(c => c.stage === "Hired").length
  };
  
  // Handle candidate click
  const handleCandidateClick = (candidate: typeof candidates[0]) => {
    setSelectedCandidate(candidate);
  };
  
  // Render candidate detail view
  if (selectedCandidate) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCandidate(null)} 
                className="mb-2"
              >
                ← Back to Pipeline
              </Button>
              <CardTitle>{selectedCandidate.name}</CardTitle>
              <CardDescription>{selectedCandidate.position} • {selectedCandidate.department}</CardDescription>
            </div>
            <Badge variant={
              selectedCandidate.status === "Active" ? "default" : 
              selectedCandidate.status === "New" ? "secondary" : 
              "outline"
            }>
              {selectedCandidate.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Applied Date</div>
              <div>{selectedCandidate.appliedDate}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Current Stage</div>
              <div>{selectedCandidate.stage}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Last Activity</div>
              <div>{selectedCandidate.lastActivity}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Days in Process</div>
              <div>{Math.floor((new Date().getTime() - new Date(selectedCandidate.appliedDate).getTime()) / (1000 * 60 * 60 * 24))}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Candidate Progress</h3>
            <div className="relative">
              <div className="flex justify-between mb-2">
                <div className="text-center flex-1">
                  <div className="w-6 h-6 rounded-full bg-green-500 mx-auto flex items-center justify-center text-white text-xs">✓</div>
                  <div className="text-xs mt-1">Application</div>
                </div>
                <div className="text-center flex-1">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white text-xs ${selectedCandidate.stage === "Screening" || selectedCandidate.stage === "Assessment" || selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "bg-green-500" : "bg-muted"}`}>
                    {selectedCandidate.stage === "Screening" || selectedCandidate.stage === "Assessment" || selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "✓" : "2"}
                  </div>
                  <div className="text-xs mt-1">Screening</div>
                </div>
                <div className="text-center flex-1">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white text-xs ${selectedCandidate.stage === "Assessment" || selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "bg-green-500" : "bg-muted"}`}>
                    {selectedCandidate.stage === "Assessment" || selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "✓" : "3"}
                  </div>
                  <div className="text-xs mt-1">Assessment</div>
                </div>
                <div className="text-center flex-1">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white text-xs ${selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "bg-green-500" : "bg-muted"}`}>
                    {selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "✓" : "4"}
                  </div>
                  <div className="text-xs mt-1">Interview</div>
                </div>
                <div className="text-center flex-1">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white text-xs ${selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "bg-green-500" : "bg-muted"}`}>
                    {selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired" ? "✓" : "5"}
                  </div>
                  <div className="text-xs mt-1">Offer</div>
                </div>
                <div className="text-center flex-1">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white text-xs ${selectedCandidate.stage === "Hired" ? "bg-green-500" : "bg-muted"}`}>
                    {selectedCandidate.stage === "Hired" ? "✓" : "6"}
                  </div>
                  <div className="text-xs mt-1">Hired</div>
                </div>
              </div>
              <div className="absolute top-3 left-[8%] right-[8%] h-1 bg-muted"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Candidate Timeline</h3>
              <Button size="sm" variant="outline">Add Note</Button>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                <div className="text-sm font-medium">Application Received</div>
                <div className="text-xs text-muted-foreground">{selectedCandidate.appliedDate}</div>
                <div className="mt-1 text-sm">Candidate applied for {selectedCandidate.position} position</div>
              </div>
              
              {selectedCandidate.stage !== "Application" && (
                <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                  <div className="text-sm font-medium">Resume Screened</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(new Date(selectedCandidate.appliedDate).getTime() + 2*24*60*60*1000).toISOString().split('T')[0]}
                  </div>
                  <div className="mt-1 text-sm">Resume reviewed and candidate moved to screening stage</div>
                </div>
              )}
              
              {(selectedCandidate.stage === "Assessment" || selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired") && (
                <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                  <div className="text-sm font-medium">Assessment Sent</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(new Date(selectedCandidate.appliedDate).getTime() + 4*24*60*60*1000).toISOString().split('T')[0]}
                  </div>
                  <div className="mt-1 text-sm">Technical assessment sent to candidate</div>
                </div>
              )}
              
              {(selectedCandidate.stage === "Interview" || selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired") && (
                <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                  <div className="text-sm font-medium">Interview Scheduled</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(new Date(selectedCandidate.appliedDate).getTime() + 7*24*60*60*1000).toISOString().split('T')[0]}
                  </div>
                  <div className="mt-1 text-sm">First round interview scheduled with hiring manager</div>
                </div>
              )}
              
              {(selectedCandidate.stage === "Offer" || selectedCandidate.stage === "Hired") && (
                <div className="border-l-2 border-blue-500 pl-4 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-0"></div>
                  <div className="text-sm font-medium">Offer Extended</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(new Date(selectedCandidate.appliedDate).getTime() + 12*24*60*60*1000).toISOString().split('T')[0]}
                  </div>
                  <div className="mt-1 text-sm">Job offer sent to candidate</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline">Reject</Button>
            <Button variant="outline">Move to Next Stage</Button>
            <Button>Contact Candidate</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Application</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{stageCounts.application}</div>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Screening</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{stageCounts.screening}</div>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Assessment</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{stageCounts.assessment}</div>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Interview</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{stageCounts.interview}</div>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Offer</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{stageCounts.offer}</div>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{stageCounts.hired}</div>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Candidate Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button>
            <ChevronRight className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>
      
      {/* Candidates Table */}
      <Card className="bg-background border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow 
                  key={candidate.id} 
                  className="cursor-pointer"
                  onClick={() => handleCandidateClick(candidate)}
                >
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>{candidate.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{candidate.stage}</Badge>
                  </TableCell>
                  <TableCell>{candidate.appliedDate}</TableCell>
                  <TableCell>{candidate.lastActivity}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
