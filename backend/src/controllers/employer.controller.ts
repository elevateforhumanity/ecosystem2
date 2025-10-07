import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Employers
export async function createEmployer(req: AuthRequest, res: Response) {
  try {
    const { companyName, industry, contactPerson, contactTitle, email, phone, address, city, state, zipCode,
            website, companySize, employeeCount, partnershipType, notes } = req.body;
    
    const id = `emp_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO employers (
        id, company_name, industry, contact_person, contact_title, email, phone,
        address, city, state, zip_code, website, company_size, employee_count,
        partnership_type, partnership_start_date, job_postings, placements, active, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), $16, $17, $18, $19)
      RETURNING *`,
      [id, companyName, industry, contactPerson, contactTitle, email, phone, address, city, state, zipCode,
       website, companySize, employeeCount, partnershipType, JSON.stringify([]), JSON.stringify([]), true, notes]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getEmployers(req: AuthRequest, res: Response) {
  try {
    const { industry, partnershipType, active } = req.query;
    
    let query = 'SELECT * FROM employers WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (industry) {
      query += ` AND industry = $${paramCount++}`;
      params.push(industry);
    }
    if (partnershipType) {
      query += ` AND partnership_type = $${paramCount++}`;
      params.push(partnershipType);
    }
    if (active !== undefined) {
      query += ` AND active = $${paramCount++}`;
      params.push(active === 'true');
    }
    
    query += ' ORDER BY company_name ASC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getEmployerById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM employers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employer not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateEmployer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At') && k !== 'job_postings' && k !== 'placements');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE employers SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employer not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Job Postings
export async function createJobPosting(req: AuthRequest, res: Response) {
  try {
    const { employerId, title, description, requirements, jobType, salaryMin, salaryMax, salaryType,
            benefits, location, remote, openings, closingDate } = req.body;
    
    const id = `job_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO job_postings (
        id, employer_id, title, description, requirements, job_type, salary_min, salary_max,
        salary_type, benefits, location, remote, openings, posted_date, closing_date, status, applications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14, $15, $16)
      RETURNING *`,
      [id, employerId, title, description, JSON.stringify(requirements || []), jobType, salaryMin, salaryMax,
       salaryType, JSON.stringify(benefits || []), location, remote || false, openings, closingDate, 'open', JSON.stringify([])]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getJobPostings(req: AuthRequest, res: Response) {
  try {
    const { employerId, jobType, status, remote } = req.query;
    
    let query = 'SELECT * FROM job_postings WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (employerId) {
      query += ` AND employer_id = $${paramCount++}`;
      params.push(employerId);
    }
    if (jobType) {
      query += ` AND job_type = $${paramCount++}`;
      params.push(jobType);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    if (remote !== undefined) {
      query += ` AND remote = $${paramCount++}`;
      params.push(remote === 'true');
    }
    
    query += ' ORDER BY posted_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateJobPosting(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.requirements) updates.requirements = JSON.stringify(updates.requirements);
    if (updates.benefits) updates.benefits = JSON.stringify(updates.benefits);
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At') && k !== 'applications');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE job_postings SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job posting not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Applications
export async function createApplication(req: AuthRequest, res: Response) {
  try {
    const { jobPostingId, userId, resumeUrl, coverLetterUrl, notes } = req.body;
    
    const id = `app_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO applications (
        id, job_posting_id, user_id, resume_url, cover_letter_url, applied_date, status, notes
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING *`,
      [id, jobPostingId, userId || req.user!.id, resumeUrl, coverLetterUrl, 'submitted', notes]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getApplications(req: AuthRequest, res: Response) {
  try {
    const { jobPostingId, userId, status } = req.query;
    
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (jobPostingId) {
      query += ` AND job_posting_id = $${paramCount++}`;
      params.push(jobPostingId);
    }
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    
    query += ' ORDER BY applied_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, interviewDate, interviewNotes, offerAmount, startDate, notes } = req.body;
    
    const updates: any = { status, updated_at: 'NOW()' };
    if (interviewDate) updates.interview_date = interviewDate;
    if (interviewNotes) updates.interview_notes = interviewNotes;
    if (offerAmount) {
      updates.offer_amount = offerAmount;
      updates.offer_date = 'NOW()';
    }
    if (startDate) updates.start_date = startDate;
    if (notes) updates.notes = notes;
    
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const setClause = fields.map((field, idx) => {
      if (field === 'updated_at' || field === 'offer_date') {
        return `${field} = NOW()`;
      }
      return `${field} = $${idx + 1}`;
    }).join(', ');
    
    const values = fields.filter(f => f !== 'updated_at' && f !== 'offer_date').map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE applications SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Placements
export async function createPlacement(req: AuthRequest, res: Response) {
  try {
    const { userId, employerId, jobPostingId, jobTitle, startDate, employmentType, wage, wageType,
            hoursPerWeek, benefits, notes } = req.body;
    
    const id = `placement_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO placements (
        id, user_id, employer_id, job_posting_id, job_title, start_date, employment_type,
        wage, wage_type, hours_per_week, benefits, retention_checks, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [id, userId, employerId, jobPostingId, jobTitle, startDate, employmentType, wage, wageType,
       hoursPerWeek, JSON.stringify(benefits || []), JSON.stringify([]), 'active', notes]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getPlacements(req: AuthRequest, res: Response) {
  try {
    const { userId, employerId, status } = req.query;
    
    let query = 'SELECT * FROM placements WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (employerId) {
      query += ` AND employer_id = $${paramCount++}`;
      params.push(employerId);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    
    query += ' ORDER BY start_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function addRetentionCheck(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { quarter, employed, wage, hoursPerWeek, contactMethod, notes } = req.body;
    
    const placement = await pool.query('SELECT retention_checks FROM placements WHERE id = $1', [id]);
    if (placement.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Placement not found' } });
    }
    
    const retentionChecks = JSON.parse(placement.rows[0].retention_checks || '[]');
    const newCheck = {
      id: `check_${Date.now()}`,
      checkDate: new Date(),
      quarter,
      employed,
      wage,
      hoursPerWeek,
      contactMethod,
      notes,
      verifiedBy: req.user!.id
    };
    
    retentionChecks.push(newCheck);
    
    const result = await pool.query(
      `UPDATE placements SET retention_checks = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(retentionChecks), id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Employer Engagement
export async function createEngagement(req: AuthRequest, res: Response) {
  try {
    const { employerId, engagementType, date, purpose, outcome, attendees, followUpRequired, followUpDate, notes } = req.body;
    
    const id = `engagement_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO employer_engagements (
        id, employer_id, engagement_type, date, purpose, outcome, attendees,
        follow_up_required, follow_up_date, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [id, employerId, engagementType, date, purpose, outcome, JSON.stringify(attendees || []),
       followUpRequired || false, followUpDate, notes, req.user!.id]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getEngagements(req: AuthRequest, res: Response) {
  try {
    const { employerId, engagementType } = req.query;
    
    let query = 'SELECT * FROM employer_engagements WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (employerId) {
      query += ` AND employer_id = $${paramCount++}`;
      params.push(employerId);
    }
    if (engagementType) {
      query += ` AND engagement_type = $${paramCount++}`;
      params.push(engagementType);
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
