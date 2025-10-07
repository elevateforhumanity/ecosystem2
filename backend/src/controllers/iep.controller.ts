import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createIEP(req: AuthRequest, res: Response) {
  try {
    const { userId, caseManagerId, careerGoal, targetOccupation, targetIndustry, targetWage,
            currentSkills, skillGaps, barriers, strengths, trainingPrograms, supportServices, milestones } = req.body;
    
    const id = `iep_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO individual_employment_plans (
        id, user_id, case_manager_id, career_goal, target_occupation, target_industry, target_wage,
        current_skills, skill_gaps, barriers, strengths, training_programs, support_services,
        milestones, review_frequency_days, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [id, userId, caseManagerId || req.user!.id, careerGoal, targetOccupation, targetIndustry, targetWage,
       JSON.stringify(currentSkills || []), JSON.stringify(skillGaps || []), JSON.stringify(barriers || []),
       JSON.stringify(strengths || []), JSON.stringify(trainingPrograms || []), JSON.stringify(supportServices || []),
       JSON.stringify(milestones || []), 90, 'draft']
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getIEPs(req: AuthRequest, res: Response) {
  try {
    const { userId, caseManagerId, status } = req.query;
    
    let query = 'SELECT * FROM individual_employment_plans WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (caseManagerId) {
      query += ` AND case_manager_id = $${paramCount++}`;
      params.push(caseManagerId);
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

export async function updateIEP(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert arrays to JSON strings
    if (updates.currentSkills) updates.current_skills = JSON.stringify(updates.currentSkills);
    if (updates.skillGaps) updates.skill_gaps = JSON.stringify(updates.skillGaps);
    if (updates.barriers) updates.barriers = JSON.stringify(updates.barriers);
    if (updates.strengths) updates.strengths = JSON.stringify(updates.strengths);
    if (updates.trainingPrograms) updates.training_programs = JSON.stringify(updates.trainingPrograms);
    if (updates.supportServices) updates.support_services = JSON.stringify(updates.supportServices);
    if (updates.milestones) updates.milestones = JSON.stringify(updates.milestones);
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At'));
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE individual_employment_plans SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'IEP not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function signIEP(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { signature, role } = req.body;
    
    const field = role === 'participant' ? 'participant' : 'case_manager';
    
    const result = await pool.query(
      `UPDATE individual_employment_plans 
       SET ${field}_signature = $1, ${field}_signed_at = NOW(), status = 'active'
       WHERE id = $2 RETURNING *`,
      [signature, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'IEP not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function reviewIEP(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { nextReviewDate } = req.body;
    
    const result = await pool.query(
      `UPDATE individual_employment_plans 
       SET last_review_date = NOW(), next_review_date = $1
       WHERE id = $2 RETURNING *`,
      [nextReviewDate, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'IEP not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
