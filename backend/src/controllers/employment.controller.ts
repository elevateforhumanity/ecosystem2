import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createEmploymentOutcome(req: AuthRequest, res: Response) {
  try {
    const { userId, courseId, employmentStatus, employerName, employerContact, employerPhone, 
            employerEmail, jobTitle, startDate, hourlyWage, annualSalary, hoursPerWeek,
            verificationMethod, verificationDocumentUrl, credentialEarned, credentialType,
            credentialName, credentialDate, industryCode, occupationCode, notes } = req.body;
    
    const id = `emp_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO employment_outcomes (
        id, user_id, course_id, employment_status, employer_name, employer_contact,
        employer_phone, employer_email, job_title, start_date, hourly_wage, annual_salary,
        hours_per_week, verification_method, verification_document_url, credential_earned,
        credential_type, credential_name, credential_date, industry_code, occupation_code,
        second_quarter_retained, fourth_quarter_retained, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *`,
      [id, userId, courseId, employmentStatus, employerName, employerContact, employerPhone,
       employerEmail, jobTitle, startDate, hourlyWage, annualSalary, hoursPerWeek,
       verificationMethod, verificationDocumentUrl, credentialEarned || false, credentialType,
       credentialName, credentialDate, industryCode, occupationCode, false, false, notes]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getEmploymentOutcomes(req: AuthRequest, res: Response) {
  try {
    const { userId, courseId } = req.query;
    
    let query = 'SELECT * FROM employment_outcomes WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (courseId) {
      query += ` AND course_id = $${paramCount++}`;
      params.push(courseId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateEmploymentOutcome(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).filter(k => k !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE employment_outcomes SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employment outcome not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function verifyEmployment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { verificationMethod, verificationDocumentUrl } = req.body;
    
    const result = await pool.query(
      `UPDATE employment_outcomes 
       SET verification_method = $1, verification_document_url = $2, verified_at = NOW(), verified_by = $3
       WHERE id = $4 RETURNING *`,
      [verificationMethod, verificationDocumentUrl, req.user!.id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employment outcome not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateRetention(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { quarter, retained, wage } = req.body;
    
    const field = quarter === 2 ? 'second_quarter' : 'fourth_quarter';
    
    const result = await pool.query(
      `UPDATE employment_outcomes 
       SET ${field}_retained = $1, ${field}_verified_at = NOW(), ${field}_wage = $2
       WHERE id = $3 RETURNING *`,
      [retained, wage, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employment outcome not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
