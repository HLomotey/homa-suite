import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ChevronRight, Calendar, Users, Clock } from "lucide-react";

interface JobListingsProps {
  department: string;
}

// Mock job listings data
const jobListings = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    experience: "5+ years",
    postedDate: "2025-07-05",
    applications: 42,
    status: "Open"
  },
  {
    id: 2,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Chicago, IL",
    type: "Full-time",
    experience: "3-5 years",
    postedDate: "2025-07-08",
    applications: 28,
    status: "Open"
  },
  {
    id: 3,
    title: "Financial Analyst",
    department: "Finance",
    location: "Remote",
    type: "Full-time",
    experience: "2-4 years",
    postedDate: "2025-07-10",
    applications: 35,
    status: "Open"
  },
  {
    id: 4,
    title: "Product Manager",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "4+ years",
    postedDate: "2025-07-12",
    applications: 24,
    status: "Open"
  },
  {
    id: 5,
    title: "Sales Representative",
    department: "Sales",
    location: "Miami, FL",
    type: "Full-time",
    experience: "1-3 years",
    postedDate: "2025-07-15",
    applications: 19,
    status: "Open"
  },
  {
    id: 6,
    title: "HR Specialist",
    department: "HR",
    location: "Boston, MA",
    type: "Full-time",
    experience: "2+ years",
    postedDate: "2025-07-18",
    applications: 15,
    status: "Open"
  },
  {
    id: 7,
    title: "Support Engineer",
    department: "Support",
    location: "Austin, TX",
    type: "Full-time",
    experience: "1-3 years",
    postedDate: "2025-07-20",
    applications: 12,
    status: "Open"
  },
  {
    id: 8,
    title: "UX Designer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Full-time",
    experience: "3+ years",
    postedDate: "2025-07-22",
    applications: 8,
    status: "Open"
  }
];

export function JobListings({ department }: JobListingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<typeof jobListings[0] | null>(null);
  
  // Filter jobs based on search query, department, and location
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = department === "all" || job.department.toLowerCase() === department.toLowerCase();
    const matchesLocation = locationFilter === "all" || job.location.includes(locationFilter);
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });
  
  // Get unique locations for filter
  const locations = Array.from(new Set(jobListings.map(job => job.location)));
  
  // Handle job click
  const handleJobClick = (job: typeof jobListings[0]) => {
    setSelectedJob(job);
  };
  
  // Render job detail view
  if (selectedJob) {
    return (
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedJob(null)} 
                className="mb-2"
              >
                ← Back to Job Listings
              </Button>
              <CardTitle>{selectedJob.title}</CardTitle>
              <CardDescription>{selectedJob.department} • {selectedJob.location}</CardDescription>
            </div>
            <Badge variant={selectedJob.status === "Open" ? "success" : "default"}>
              {selectedJob.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Applications</div>
                <div>{selectedJob.applications}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Posted Date</div>
                <div>{selectedJob.postedDate}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Experience</div>
                <div>{selectedJob.experience}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 text-muted-foreground">💼</div>
              <div>
                <div className="text-sm font-medium">Job Type</div>
                <div>{selectedJob.type}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Job Description</h3>
            <div className="text-sm">
              <p>We are seeking a talented {selectedJob.title} to join our {selectedJob.department} team. This is an exciting opportunity to work on cutting-edge projects in a collaborative environment.</p>
              
              <h4 className="font-medium mt-4 mb-2">Responsibilities:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Design, develop, and maintain high-quality solutions</li>
                <li>Collaborate with cross-functional teams to define and implement innovative solutions</li>
                <li>Participate in code reviews and contribute to best practices</li>
                <li>Troubleshoot and resolve complex technical issues</li>
                <li>Stay up-to-date with industry trends and technologies</li>
              </ul>
              
              <h4 className="font-medium mt-4 mb-2">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>{selectedJob.experience} of experience in {selectedJob.department}</li>
                <li>Strong problem-solving skills and attention to detail</li>
                <li>Excellent communication and collaboration abilities</li>
                <li>Bachelor's degree in a related field or equivalent experience</li>
                <li>Ability to work in a fast-paced environment</li>
              </ul>
              
              <h4 className="font-medium mt-4 mb-2">Benefits:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Competitive salary and benefits package</li>
                <li>Flexible work arrangements</li>
                <li>Professional development opportunities</li>
                <li>Collaborative and innovative work environment</li>
                <li>Health and wellness programs</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Applicant Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background border-border">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">{selectedJob.applications}</div>
                  <p className="text-xs text-green-500">+3 this week</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background border-border">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">In Review</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">{Math.floor(selectedJob.applications * 0.6)}</div>
                  <p className="text-xs text-muted-foreground">60% of applicants</p>
                </CardContent>
              </Card>
              
              <Card className="bg-background border-border">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Interview Stage</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-2xl font-bold">{Math.floor(selectedJob.applications * 0.2)}</div>
                  <p className="text-xs text-muted-foreground">20% of applicants</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline">Edit Job</Button>
            <Button variant="outline">Close Job</Button>
            <Button>View Applicants</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Job Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{jobListings.length}</div>
            <p className="text-xs text-green-500">+3 from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{jobListings.filter(j => j.status === "Open").length}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">{jobListings.reduce((sum, job) => sum + job.applications, 0)}</div>
            <p className="text-xs text-green-500">+64 from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Avg. Applications</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="text-2xl font-bold">
              {Math.round(jobListings.reduce((sum, job) => sum + job.applications, 0) / jobListings.length)}
            </div>
            <p className="text-xs text-muted-foreground">Per position</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Job Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location, index) => (
                <SelectItem key={index} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button>
            <ChevronRight className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>
      
      {/* Jobs Table */}
      <Card className="bg-background border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow 
                  key={job.id} 
                  className="cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.postedDate}</TableCell>
                  <TableCell>{job.applications}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "Open" ? "success" : "default"}>
                      {job.status}
                    </Badge>
                  </TableCell>
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
