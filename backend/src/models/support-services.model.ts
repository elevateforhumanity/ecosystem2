export interface SupportService {
  id: string;
  userId: string;
  caseManagerId: string;
  
  serviceType: 'transportation' | 'childcare' | 'housing' | 'medical' | 'mental_health' | 
                'substance_abuse' | 'legal' | 'financial_literacy' | 'job_search' | 'other';
  
  serviceProvider: string;
  providerContact?: string;
  
  description: string;
  needAssessment: string;
  
  requestDate: Date;
  approvalStatus: 'pending' | 'approved' | 'denied' | 'completed';
  approvedBy?: string;
  approvedAt?: Date;
  denialReason?: string;
  
  startDate?: Date;
  endDate?: Date;
  
  frequency?: string;
  duration?: string;
  
  cost?: number;
  fundingSource?: string;
  
  outcomes: ServiceOutcome[];
  
  status: 'active' | 'completed' | 'cancelled';
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceOutcome {
  id: string;
  date: Date;
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
  recordedBy: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  requestedBy: string;
  
  serviceType: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  description: string;
  justification: string;
  
  estimatedCost?: number;
  
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'fulfilled';
  
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  
  contactPerson: string;
  email: string;
  phone: string;
  
  address?: string;
  website?: string;
  
  servicesOffered: string[];
  
  contractNumber?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  
  rating?: number;
  
  active: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
