export interface Employer {
  id: string;
  companyName: string;
  industry: string;
  
  contactPerson: string;
  contactTitle: string;
  email: string;
  phone: string;
  
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  website?: string;
  
  companySize: 'small' | 'medium' | 'large';
  employeeCount?: number;
  
  partnershipType: 'training' | 'placement' | 'both';
  partnershipStartDate: Date;
  
  jobPostings: JobPosting[];
  placements: Placement[];
  
  rating?: number;
  
  active: boolean;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPosting {
  id: string;
  employerId: string;
  
  title: string;
  description: string;
  requirements: string[];
  
  jobType: 'full_time' | 'part_time' | 'contract' | 'temporary';
  
  salaryMin?: number;
  salaryMax?: number;
  salaryType: 'hourly' | 'annual';
  
  benefits?: string[];
  
  location: string;
  remote: boolean;
  
  openings: number;
  
  postedDate: Date;
  closingDate?: Date;
  
  status: 'open' | 'filled' | 'closed' | 'cancelled';
  
  applications: Application[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobPostingId: string;
  userId: string;
  
  resumeUrl?: string;
  coverLetterUrl?: string;
  
  appliedDate: Date;
  
  status: 'submitted' | 'under_review' | 'interview_scheduled' | 'interviewed' | 
          'offer_extended' | 'offer_accepted' | 'offer_declined' | 'rejected';
  
  interviewDate?: Date;
  interviewNotes?: string;
  
  offerDate?: Date;
  offerAmount?: number;
  
  startDate?: Date;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Placement {
  id: string;
  userId: string;
  employerId: string;
  jobPostingId?: string;
  
  jobTitle: string;
  startDate: Date;
  
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary';
  
  wage: number;
  wageType: 'hourly' | 'annual';
  
  hoursPerWeek?: number;
  
  benefits: string[];
  
  retentionChecks: RetentionCheck[];
  
  status: 'active' | 'completed' | 'terminated';
  
  endDate?: Date;
  terminationReason?: string;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionCheck {
  id: string;
  checkDate: Date;
  quarter: 1 | 2 | 3 | 4;
  
  employed: boolean;
  
  wage?: number;
  hoursPerWeek?: number;
  
  contactMethod: 'phone' | 'email' | 'in_person' | 'survey';
  
  notes?: string;
  
  verifiedBy: string;
}

export interface EmployerEngagement {
  id: string;
  employerId: string;
  
  engagementType: 'meeting' | 'site_visit' | 'phone_call' | 'email' | 'event';
  
  date: Date;
  
  purpose: string;
  outcome?: string;
  
  attendees: string[];
  
  followUpRequired: boolean;
  followUpDate?: Date;
  
  notes?: string;
  
  recordedBy: string;
  
  createdAt: Date;
  updatedAt: Date;
}
