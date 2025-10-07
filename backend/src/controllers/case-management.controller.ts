import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createCase(req: AuthRequest, res: Response) {
  try {
    const { userId, caseManagerId, priority, contactFrequency, intakeNotes, barriers, accommodations } = req.body;
    
    const id = `case_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO case_management (
        id, user_id, case_manager_id, case_status, priority, intake_date, 
        contact_frequency, assessment_completed, barriers, accommodations, notes, activities, referrals
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [id, userId, caseManagerId || req.user!.id, 'active', priority || 'medium', 
       contactFrequency || 'monthly', false, JSON.stringify(barriers || []), 
       JSON.stringify(accommodations || []), JSON.stringify([]), JSON.stringify([]), JSON.stringify([])]
    );
    
    // Add intake note if provided
    if (intakeNotes) {
      const noteId = `note_${Date.now()}`;
      const note = {
        id: noteId,
        date: new Date(),
        type: 'general',
        content: intakeNotes,
        createdBy: req.user!.id,
        confidential: false
      };
      
      await pool.query(
        `UPDATE case_management SET notes = $1 WHERE id = $2`,
        [JSON.stringify([note]), id]
      );
    }
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getCases(req: AuthRequest, res: Response) {
  try {
    const { userId, caseManagerId, status, priority } = req.query;
    
    let query = 'SELECT * FROM case_management WHERE 1=1';
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
      query += ` AND case_status = $${paramCount++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND priority = $${paramCount++}`;
      params.push(priority);
    }
    
    query += ' ORDER BY priority DESC, last_contact_date ASC NULLS FIRST';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getCaseById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM case_management WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateCase(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert arrays to JSON strings
    if (updates.barriers) updates.barriers = JSON.stringify(updates.barriers);
    if (updates.accommodations) updates.accommodations = JSON.stringify(updates.accommodations);
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At') && k !== 'notes' && k !== 'activities' && k !== 'referrals');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE case_management SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function addCaseNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { type, content, confidential } = req.body;
    
    const caseRecord = await pool.query('SELECT notes FROM case_management WHERE id = $1', [id]);
    if (caseRecord.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    const notes = JSON.parse(caseRecord.rows[0].notes || '[]');
    const newNote = {
      id: `note_${Date.now()}`,
      date: new Date(),
      type: type || 'general',
      content,
      createdBy: req.user!.id,
      confidential: confidential || false
    };
    
    notes.push(newNote);
    
    const result = await pool.query(
      `UPDATE case_management SET notes = $1, last_contact_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(notes), id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function addCaseActivity(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { activityType, description, outcome, hoursSpent } = req.body;
    
    const caseRecord = await pool.query('SELECT activities FROM case_management WHERE id = $1', [id]);
    if (caseRecord.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    const activities = JSON.parse(caseRecord.rows[0].activities || '[]');
    const newActivity = {
      id: `activity_${Date.now()}`,
      date: new Date(),
      activityType,
      description,
      outcome,
      hoursSpent,
      createdBy: req.user!.id
    };
    
    activities.push(newActivity);
    
    const result = await pool.query(
      `UPDATE case_management SET activities = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(activities), id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function addReferral(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { service, provider, notes } = req.body;
    
    const caseRecord = await pool.query('SELECT referrals FROM case_management WHERE id = $1', [id]);
    if (caseRecord.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    const referrals = JSON.parse(caseRecord.rows[0].referrals || '[]');
    const newReferral = {
      id: `referral_${Date.now()}`,
      date: new Date(),
      service,
      provider,
      status: 'pending',
      notes
    };
    
    referrals.push(newReferral);
    
    const result = await pool.query(
      `UPDATE case_management SET referrals = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(referrals), id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateReferralStatus(req: AuthRequest, res: Response) {
  try {
    const { id, referralId } = req.params;
    const { status, notes } = req.body;
    
    const caseRecord = await pool.query('SELECT referrals FROM case_management WHERE id = $1', [id]);
    if (caseRecord.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    const referrals = JSON.parse(caseRecord.rows[0].referrals || '[]');
    const referralIndex = referrals.findIndex((r: any) => r.id === referralId);
    
    if (referralIndex === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Referral not found' } });
    }
    
    referrals[referralIndex].status = status;
    if (notes) referrals[referralIndex].notes = notes;
    
    const result = await pool.query(
      `UPDATE case_management SET referrals = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(referrals), id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function completeAssessment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE case_management SET assessment_completed = true, assessment_date = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function closeCase(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { exitReason, exitNotes } = req.body;
    
    const result = await pool.query(
      `UPDATE case_management 
       SET case_status = 'closed', exit_date = NOW(), exit_reason = $1, exit_notes = $2, updated_at = NOW() 
       WHERE id = $3 RETURNING *`,
      [exitReason, exitNotes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
