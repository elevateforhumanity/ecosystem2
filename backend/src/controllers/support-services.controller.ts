import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Support Services
export async function createSupportService(req: AuthRequest, res: Response) {
  try {
    const { userId, caseManagerId, serviceType, serviceProvider, providerContact, description, 
            needAssessment, startDate, endDate, frequency, duration, cost, fundingSource, notes } = req.body;
    
    const id = `service_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO support_services (
        id, user_id, case_manager_id, service_type, service_provider, provider_contact,
        description, need_assessment, request_date, approval_status, start_date, end_date,
        frequency, duration, cost, funding_source, outcomes, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [id, userId, caseManagerId || req.user!.id, serviceType, serviceProvider, providerContact,
       description, needAssessment, 'pending', startDate, endDate, frequency, duration, 
       cost, fundingSource, JSON.stringify([]), 'active', notes]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getSupportServices(req: AuthRequest, res: Response) {
  try {
    const { userId, caseManagerId, serviceType, approvalStatus, status } = req.query;
    
    let query = 'SELECT * FROM support_services WHERE 1=1';
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
    if (serviceType) {
      query += ` AND service_type = $${paramCount++}`;
      params.push(serviceType);
    }
    if (approvalStatus) {
      query += ` AND approval_status = $${paramCount++}`;
      params.push(approvalStatus);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    
    query += ' ORDER BY request_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getSupportServiceById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM support_services WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Support service not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateSupportService(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At') && k !== 'outcomes');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE support_services SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Support service not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function approveSupportService(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { approved, denialReason } = req.body;
    
    const approvalStatus = approved ? 'approved' : 'denied';
    
    const result = await pool.query(
      `UPDATE support_services 
       SET approval_status = $1, approved_by = $2, approved_at = NOW(), denial_reason = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [approvalStatus, req.user!.id, denialReason, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Support service not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function addServiceOutcome(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { description, impact } = req.body;
    
    const service = await pool.query('SELECT outcomes FROM support_services WHERE id = $1', [id]);
    if (service.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Support service not found' } });
    }
    
    const outcomes = JSON.parse(service.rows[0].outcomes || '[]');
    const newOutcome = {
      id: `outcome_${Date.now()}`,
      date: new Date(),
      description,
      impact: impact || 'neutral',
      recordedBy: req.user!.id
    };
    
    outcomes.push(newOutcome);
    
    const result = await pool.query(
      `UPDATE support_services SET outcomes = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(outcomes), id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function completeSupportService(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE support_services 
       SET status = 'completed', approval_status = 'completed', end_date = NOW(), updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Support service not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Service Requests
export async function createServiceRequest(req: AuthRequest, res: Response) {
  try {
    const { userId, serviceType, urgency, description, justification, estimatedCost } = req.body;
    
    const id = `req_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO service_requests (
        id, user_id, requested_by, service_type, urgency, description, 
        justification, estimated_cost, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [id, userId, req.user!.id, serviceType, urgency || 'medium', description, 
       justification, estimatedCost, 'submitted']
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getServiceRequests(req: AuthRequest, res: Response) {
  try {
    const { userId, status, urgency } = req.query;
    
    let query = 'SELECT * FROM service_requests WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    if (urgency) {
      query += ` AND urgency = $${paramCount++}`;
      params.push(urgency);
    }
    
    query += ' ORDER BY urgency DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function reviewServiceRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    
    const result = await pool.query(
      `UPDATE service_requests 
       SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_notes = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [status, req.user!.id, reviewNotes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service request not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

// Service Providers
export async function createServiceProvider(req: AuthRequest, res: Response) {
  try {
    const { name, type, contactPerson, email, phone, address, website, servicesOffered, 
            contractNumber, contractStartDate, contractEndDate } = req.body;
    
    const id = `provider_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO service_providers (
        id, name, type, contact_person, email, phone, address, website,
        services_offered, contract_number, contract_start_date, contract_end_date, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [id, name, type, contactPerson, email, phone, address, website,
       JSON.stringify(servicesOffered || []), contractNumber, contractStartDate, contractEndDate, true]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getServiceProviders(req: AuthRequest, res: Response) {
  try {
    const { type, active } = req.query;
    
    let query = 'SELECT * FROM service_providers WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }
    if (active !== undefined) {
      query += ` AND active = $${paramCount++}`;
      params.push(active === 'true');
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function updateServiceProvider(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.servicesOffered) {
      updates.services_offered = JSON.stringify(updates.servicesOffered);
      delete updates.servicesOffered;
    }
    
    const fields = Object.keys(updates).filter(k => k !== 'id' && !k.includes('At'));
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } });
    }
    
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE service_providers SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service provider not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
