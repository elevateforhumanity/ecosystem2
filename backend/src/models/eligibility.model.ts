export interface ParticipantEligibility {
  id: string;
  userId: string;
  
  // Demographics
  dateOfBirth: Date;
  gender?: string;
  ethnicity?: string;
  race: string[];
  
  // Eligibility Categories
  isVeteran: boolean;
  veteranDocumentUrl?: string;
  veteranVerifiedAt?: Date;
  
  isDislocatedWorker: boolean;
  dislocatedWorkerDocumentUrl?: string;
  layoffDate?: Date;
  dislocatedWorkerVerifiedAt?: Date;
  
  isLowIncome: boolean;
  incomeDocumentUrl?: string;
  householdSize?: number;
  annualIncome?: number;
  lowIncomeVerifiedAt?: Date;
  
  isYouth: boolean;
  youthVerifiedAt?: Date;
  
  hasDisability: boolean;
  disabilityDocumentUrl?: string;
  disabilityType?: string;
  disabilityVerifiedAt?: Date;
  
  // Eligibility Status
  eligibilityStatus: 'pending' | 'approved' | 'denied' | 'expired';
  approvedBy?: string;
  approvedAt?: Date;
  expiresAt?: Date;
  denialReason?: string;
  
  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface EligibilityCreateInput {
  userId: string;
  dateOfBirth: Date;
  gender?: string;
  ethnicity?: string;
  race?: string[];
  isVeteran?: boolean;
  veteranDocumentUrl?: string;
  isDislocatedWorker?: boolean;
  dislocatedWorkerDocumentUrl?: string;
  layoffDate?: Date;
  isLowIncome?: boolean;
  incomeDocumentUrl?: string;
  householdSize?: number;
  annualIncome?: number;
  isYouth?: boolean;
  hasDisability?: boolean;
  disabilityDocumentUrl?: string;
  disabilityType?: string;
  notes?: string;
}

export interface EligibilityUpdateInput {
  dateOfBirth?: Date;
  gender?: string;
  ethnicity?: string;
  race?: string[];
  isVeteran?: boolean;
  veteranDocumentUrl?: string;
  isDislocatedWorker?: boolean;
  dislocatedWorkerDocumentUrl?: string;
  layoffDate?: Date;
  isLowIncome?: boolean;
  incomeDocumentUrl?: string;
  householdSize?: number;
  annualIncome?: number;
  isYouth?: boolean;
  hasDisability?: boolean;
  disabilityDocumentUrl?: string;
  disabilityType?: string;
  notes?: string;
}

export interface EligibilityApprovalInput {
  eligibilityStatus: 'approved' | 'denied';
  denialReason?: string;
  expiresAt?: Date;
}
