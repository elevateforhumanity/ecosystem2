export interface CaseManagementRecord {
  id: string;
  userId: string;
  caseManagerId: string;
  
  assignedDate: Date;
  caseStatus: 'active' | 'inactive' | 'closed' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  intakeDate: Date;
  intakeNotes?: string;
  assessmentCompleted: boolean;
  assessmentDate?: Date;
  
  contactFrequency: 'weekly' | 'biweekly' | 'monthly';
  lastContactDate?: Date;
  nextContactDate?: Date;
  
  notes: CaseNote[];
  activities: CaseActivity[];
  referrals: Referral[];
  
  barriers: string[];
  accommodations: string[];
  
  exitDate?: Date;
  exitReason?: string;
  exitNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseNote {
  id: string;
  date: Date;
  type: 'contact' | 'assessment' | 'progress' | 'incident' | 'general';
  content: string;
  createdBy: string;
  confidential: boolean;
}

export interface CaseActivity {
  id: string;
  date: Date;
  activityType: string;
  description: string;
  outcome?: string;
  hoursSpent?: number;
  createdBy: string;
}

export interface Referral {
  id: string;
  date: Date;
  service: string;
  provider: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  notes?: string;
}
