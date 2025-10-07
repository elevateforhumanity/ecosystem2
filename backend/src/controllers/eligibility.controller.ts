import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';
import { ParticipantEligibility, EligibilityCreateInput, EligibilityUpdateInput, EligibilityApprovalInput } from '../models/eligibility.model';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Get eligibility record for a user
 */
export async function getEligibility(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.userId || req.user!.id;
    
    // Check authorization
    if (userId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'case_manager') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to view this eligibility record' }
      });
    }
    
    const result = await pool.query(
      'SELECT * FROM participant_eligibility WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Eligibility record not found' }
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
}

/**
 * Create eligibility record
 */
export async function createEligibility(req: AuthRequest, res: Response) {
  try {
    const input: EligibilityCreateInput = req.body;
    const userId = input.userId || req.user!.id;
    
    // Check if eligibility record already exists
    const existing = await pool.query(
      'SELECT id FROM participant_eligibility WHERE user_id = $1',
      [userId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Eligibility record already exists' }
      });
    }
    
    const id = `elig_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO participant_eligibility (
        id, user_id, date_of_birth, gender, ethnicity, race,
        is_veteran, veteran_document_url,
        is_dislocated_worker, dislocated_worker_document_url, layoff_date,
        is_low_income, income_document_url, household_size, annual_income,
        is_youth, has_disability, disability_document_url, disability_type,
        eligibility_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        id, userId, input.dateOfBirth, input.gender, input.ethnicity, JSON.stringify(input.race || []),
        input.isVeteran || false, input.veteranDocumentUrl,
        input.isDislocatedWorker || false, input.dislocatedWorkerDocumentUrl, input.layoffDate,
        input.isLowIncome || false, input.incomeDocumentUrl, input.householdSize, input.annualIncome,
        input.isYouth || false, input.hasDisability || false, input.disabilityDocumentUrl, input.disabilityType,
        'pending', input.notes
      ]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
}

/**
 * Update eligibility record
 */
export async function updateEligibility(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const input: EligibilityUpdateInput = req.body;
    
    // Check if record exists and user has permission
    const existing = await pool.query(
      'SELECT user_id, eligibility_status FROM participant_eligibility WHERE id = $1',
      [id]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Eligibility record not found' }
      });
    }
    
    const record = existing.rows[0];
    
    // Only allow updates if pending or by admin/case manager
    if (record.eligibility_status !== 'pending' && req.user!.role !== 'admin' && req.user!.role !== 'case_manager') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cannot update approved/denied eligibility record' }
      });
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (input.dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(input.dateOfBirth);
    }
    if (input.gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      values.push(input.gender);
    }
    if (input.ethnicity !== undefined) {
      updates.push(`ethnicity = $${paramCount++}`);
      values.push(input.ethnicity);
    }
    if (input.race !== undefined) {
      updates.push(`race = $${paramCount++}`);
      values.push(JSON.stringify(input.race));
    }
    if (input.isVeteran !== undefined) {
      updates.push(`is_veteran = $${paramCount++}`);
      values.push(input.isVeteran);
    }
    if (input.veteranDocumentUrl !== undefined) {
      updates.push(`veteran_document_url = $${paramCount++}`);
      values.push(input.veteranDocumentUrl);
    }
    if (input.isDislocatedWorker !== undefined) {
      updates.push(`is_dislocated_worker = $${paramCount++}`);
      values.push(input.isDislocatedWorker);
    }
    if (input.dislocatedWorkerDocumentUrl !== undefined) {
      updates.push(`dislocated_worker_document_url = $${paramCount++}`);
      values.push(input.dislocatedWorkerDocumentUrl);
    }
    if (input.layoffDate !== undefined) {
      updates.push(`layoff_date = $${paramCount++}`);
      values.push(input.layoffDate);
    }
    if (input.isLowIncome !== undefined) {
      updates.push(`is_low_income = $${paramCount++}`);
      values.push(input.isLowIncome);
    }
    if (input.incomeDocumentUrl !== undefined) {
      updates.push(`income_document_url = $${paramCount++}`);
      values.push(input.incomeDocumentUrl);
    }
    if (input.householdSize !== undefined) {
      updates.push(`household_size = $${paramCount++}`);
      values.push(input.householdSize);
    }
    if (input.annualIncome !== undefined) {
      updates.push(`annual_income = $${paramCount++}`);
      values.push(input.annualIncome);
    }
    if (input.isYouth !== undefined) {
      updates.push(`is_youth = $${paramCount++}`);
      values.push(input.isYouth);
    }
    if (input.hasDisability !== undefined) {
      updates.push(`has_disability = $${paramCount++}`);
      values.push(input.hasDisability);
    }
    if (input.disabilityDocumentUrl !== undefined) {
      updates.push(`disability_document_url = $${paramCount++}`);
      values.push(input.disabilityDocumentUrl);
    }
    if (input.disabilityType !== undefined) {
      updates.push(`disability_type = $${paramCount++}`);
      values.push(input.disabilityType);
    }
    if (input.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(input.notes);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_UPDATES', message: 'No fields to update' }
      });
    }
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE participant_eligibility SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
}

/**
 * Approve or deny eligibility (admin/case manager only)
 */
export async function approveEligibility(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const input: EligibilityApprovalInput = req.body;
    
    // Only admin and case managers can approve/deny
    if (req.user!.role !== 'admin' && req.user!.role !== 'case_manager') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins and case managers can approve eligibility' }
      });
    }
    
    const result = await pool.query(
      `UPDATE participant_eligibility 
       SET eligibility_status = $1, 
           approved_by = $2, 
           approved_at = NOW(), 
           expires_at = $3,
           denial_reason = $4
       WHERE id = $5
       RETURNING *`,
      [input.eligibilityStatus, req.user!.id, input.expiresAt, input.denialReason, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Eligibility record not found' }
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
}

/**
 * Get all pending eligibility records (admin/case manager only)
 */
export async function getPendingEligibility(req: AuthRequest, res: Response) {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'case_manager') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins and case managers can view pending eligibility' }
      });
    }
    
    const result = await pool.query(
      `SELECT pe.*, u.name, u.email 
       FROM participant_eligibility pe
       JOIN users u ON pe.user_id = u.id
       WHERE pe.eligibility_status = 'pending'
       ORDER BY pe.created_at ASC`
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
}
