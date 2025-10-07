import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Financial Records
export async function createFinancialRecord(req: AuthRequest, res: Response) {
  try {
    const { userId, programId, fundingSource, grantNumber, fiscalYear, allocatedAmount, budgetCategory } = req.body;
    
    const id = `fin_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO financial_records (
        id, user_id, program_id, funding_source, grant_number, fiscal_year,
        allocated_amount, spent_amount, remaining_amount, transactions, budget_category, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [id, userId, programId, fundingSource, grantNumber, fiscalYear, 
       allocatedAmount, 0, allocatedAmount, JSON.stringify([]), budgetCategory, 'active']
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getFinancialRecords(req: AuthRequest, res: Response) {
  try {
    const { userId, programId, fundingSource, fiscalYear, status } = req.query;
    
    let query = 'SELECT * FROM financial_records WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (programId) {
      query += ` AND program_id = $${paramCount++}`;
      params.push(programId);
    }
    if (fundingSource) {
      query += ` AND funding_source = $${paramCount++}`;
      params.push(fundingSource);
    }
    if (fiscalYear) {
      query += ` AND fiscal_year = $${paramCount++}`;
      params.push(fiscalYear);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function addTransaction(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { type, amount, category, description, vendor, invoiceNumber, notes } = req.body;
    
    const record = await pool.query('SELECT * FROM financial_records WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Financial record not found' } });
    }
    
    const transactions = JSON.parse(record.rows[0].transactions || '[]');
    const newTransaction = {
      id: `txn_${Date.now()}`,
      date: new Date(),
      type,
      amount,
      category,
      description,
      vendor,
      invoiceNumber,
      approvedBy: req.user!.id,
      approvedAt: new Date(),
      notes
    };
    
    transactions.push(newTransaction);
    
    let spentAmount = record.rows[0].spent_amount;
    if (type === 'expenditure') {
      spentAmount += amount;
    } else if (type === 'refund') {
      spentAmount -= amount;
    }
    
    const remainingAmount = record.rows[0].allocated_amount - spentAmount;
    
    const result = await pool.query(
      `UPDATE financial_records 
       SET transactions = $1, spent_amount = $2, remaining_amount = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [JSON.stringify(transactions), spentAmount, remainingAmount, id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Budget Allocations
export async function createBudgetAllocation(req: AuthRequest, res: Response) {
  try {
    const { programId, fiscalYear, fundingSource, totalBudget, 
            trainingBudget, supportServicesBudget, administrationBudget, equipmentBudget, otherBudget } = req.body;
    
    const id = `budget_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO budget_allocations (
        id, program_id, fiscal_year, funding_source, total_budget,
        training_budget, support_services_budget, administration_budget, equipment_budget, other_budget,
        training_spent, support_services_spent, administration_spent, equipment_spent, other_spent, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [id, programId, fiscalYear, fundingSource, totalBudget,
       trainingBudget || 0, supportServicesBudget || 0, administrationBudget || 0, equipmentBudget || 0, otherBudget || 0,
       0, 0, 0, 0, 0, 'draft']
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getBudgetAllocations(req: AuthRequest, res: Response) {
  try {
    const { programId, fiscalYear, status } = req.query;
    
    let query = 'SELECT * FROM budget_allocations WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (programId) {
      query += ` AND program_id = $${paramCount++}`;
      params.push(programId);
    }
    if (fiscalYear) {
      query += ` AND fiscal_year = $${paramCount++}`;
      params.push(fiscalYear);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    
    query += ' ORDER BY fiscal_year DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateBudgetAllocation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At') && !k.includes('_spent'));
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE budget_allocations SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget allocation not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Participant Costs
export async function createParticipantCost(req: AuthRequest, res: Response) {
  try {
    const { userId, financialRecordId, costType, amount, vendor, receiptUrl, notes } = req.body;
    
    const id = `cost_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO participant_costs (
        id, user_id, financial_record_id, cost_type, amount, date,
        vendor, receipt_url, approved, reimbursed, notes
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10)
      RETURNING *`,
      [id, userId, financialRecordId, costType, amount, vendor, receiptUrl, false, false, notes]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getParticipantCosts(req: AuthRequest, res: Response) {
  try {
    const { userId, financialRecordId, costType, approved, reimbursed } = req.query;
    
    let query = 'SELECT * FROM participant_costs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (financialRecordId) {
      query += ` AND financial_record_id = $${paramCount++}`;
      params.push(financialRecordId);
    }
    if (costType) {
      query += ` AND cost_type = $${paramCount++}`;
      params.push(costType);
    }
    if (approved !== undefined) {
      query += ` AND approved = $${paramCount++}`;
      params.push(approved === 'true');
    }
    if (reimbursed !== undefined) {
      query += ` AND reimbursed = $${paramCount++}`;
      params.push(reimbursed === 'true');
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function approveParticipantCost(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE participant_costs 
       SET approved = true, approved_by = $1, approved_at = NOW(), updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [req.user!.id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Participant cost not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function reimburseParticipantCost(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE participant_costs 
       SET reimbursed = true, reimbursed_date = NOW(), updated_at = NOW() 
       WHERE id = $1 AND approved = true RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Participant cost not found or not approved' } 
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getFinancialSummary(req: AuthRequest, res: Response) {
  try {
    const { programId, fiscalYear } = req.query;
    
    let query = 'SELECT * FROM financial_records WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (programId) {
      query += ` AND program_id = $${paramCount++}`;
      params.push(programId);
    }
    if (fiscalYear) {
      query += ` AND fiscal_year = $${paramCount++}`;
      params.push(fiscalYear);
    }
    
    const records = await pool.query(query, params);
    
    const summary = {
      totalAllocated: 0,
      totalSpent: 0,
      totalRemaining: 0,
      byCategory: {} as any
    };
    
    records.rows.forEach((record: any) => {
      summary.totalAllocated += parseFloat(record.allocated_amount);
      summary.totalSpent += parseFloat(record.spent_amount);
      summary.totalRemaining += parseFloat(record.remaining_amount);
      
      const category = record.budget_category;
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { allocated: 0, spent: 0, remaining: 0 };
      }
      summary.byCategory[category].allocated += parseFloat(record.allocated_amount);
      summary.byCategory[category].spent += parseFloat(record.spent_amount);
      summary.byCategory[category].remaining += parseFloat(record.remaining_amount);
    });
    
    res.json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
