import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as financialController from '../controllers/financial.controller';

const router = Router();

// Financial Records
router.post('/records', authenticate, authorize('admin', 'financial_manager'), financialController.createFinancialRecord);
router.get('/records', authenticate, authorize('admin', 'financial_manager'), financialController.getFinancialRecords);
router.post('/records/:id/transactions', authenticate, authorize('admin', 'financial_manager'), financialController.addTransaction);

// Budget Allocations
router.post('/budgets', authenticate, authorize('admin', 'financial_manager'), financialController.createBudgetAllocation);
router.get('/budgets', authenticate, authorize('admin', 'financial_manager'), financialController.getBudgetAllocations);
router.put('/budgets/:id', authenticate, authorize('admin', 'financial_manager'), financialController.updateBudgetAllocation);

// Participant Costs
router.post('/costs', authenticate, authorize('admin', 'case_manager', 'participant'), financialController.createParticipantCost);
router.get('/costs', authenticate, authorize('admin', 'financial_manager', 'case_manager'), financialController.getParticipantCosts);
router.post('/costs/:id/approve', authenticate, authorize('admin', 'financial_manager'), financialController.approveParticipantCost);
router.post('/costs/:id/reimburse', authenticate, authorize('admin', 'financial_manager'), financialController.reimburseParticipantCost);

// Summary
router.get('/summary', authenticate, authorize('admin', 'financial_manager'), financialController.getFinancialSummary);

export default router;
