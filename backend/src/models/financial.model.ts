export interface FinancialRecord {
  id: string;
  userId: string;
  programId: string;
  
  fundingSource: string;
  grantNumber?: string;
  fiscalYear: number;
  
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  
  transactions: Transaction[];
  
  budgetCategory: 'training' | 'support_services' | 'administration' | 'equipment' | 'other';
  
  status: 'active' | 'completed' | 'suspended';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'allocation' | 'expenditure' | 'refund' | 'adjustment';
  amount: number;
  category: string;
  description: string;
  vendor?: string;
  invoiceNumber?: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface BudgetAllocation {
  id: string;
  programId: string;
  fiscalYear: number;
  
  fundingSource: string;
  totalBudget: number;
  
  trainingBudget: number;
  supportServicesBudget: number;
  administrationBudget: number;
  equipmentBudget: number;
  otherBudget: number;
  
  trainingSpent: number;
  supportServicesSpent: number;
  administrationSpent: number;
  equipmentSpent: number;
  otherSpent: number;
  
  status: 'draft' | 'approved' | 'active' | 'closed';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantCost {
  id: string;
  userId: string;
  financialRecordId: string;
  
  costType: 'tuition' | 'books' | 'supplies' | 'transportation' | 'childcare' | 'housing' | 'other';
  amount: number;
  date: Date;
  
  vendor?: string;
  receiptUrl?: string;
  
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  reimbursed: boolean;
  reimbursedDate?: Date;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
