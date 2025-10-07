export interface EmploymentOutcome {
  id: string;
  userId: string;
  courseId?: string;
  
  employmentStatus: 'employed' | 'unemployed' | 'continuing_education';
  employerName?: string;
  employerContact?: string;
  employerPhone?: string;
  employerEmail?: string;
  jobTitle?: string;
  startDate?: Date;
  endDate?: Date;
  
  hourlyWage?: number;
  annualSalary?: number;
  hoursPerWeek?: number;
  
  verificationMethod?: string;
  verificationDocumentUrl?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  
  secondQuarterRetained: boolean;
  secondQuarterVerifiedAt?: Date;
  secondQuarterWage?: number;
  
  fourthQuarterRetained: boolean;
  fourthQuarterVerifiedAt?: Date;
  fourthQuarterWage?: number;
  
  credentialEarned: boolean;
  credentialType?: string;
  credentialName?: string;
  credentialDate?: Date;
  credentialDocumentUrl?: string;
  
  industryCode?: string;
  occupationCode?: string;
  
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
