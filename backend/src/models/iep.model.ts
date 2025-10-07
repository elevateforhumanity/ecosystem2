export interface IndividualEmploymentPlan {
  id: string;
  userId: string;
  caseManagerId: string;
  
  careerGoal: string;
  targetOccupation?: string;
  targetIndustry?: string;
  targetWage?: number;
  
  currentSkills: string[];
  skillGaps: string[];
  barriers: string[];
  strengths: string[];
  
  trainingPrograms: TrainingProgram[];
  supportServices: SupportService[];
  milestones: Milestone[];
  
  participantSignature?: string;
  participantSignedAt?: Date;
  caseManagerSignature?: string;
  caseManagerSignedAt?: Date;
  
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewFrequencyDays: number;
  
  status: 'draft' | 'active' | 'completed' | 'archived';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingProgram {
  courseId: string;
  startDate: Date;
  expectedEndDate: Date;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface SupportService {
  service: string;
  provider: string;
  startDate: Date;
  endDate?: Date;
}

export interface Milestone {
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
}
