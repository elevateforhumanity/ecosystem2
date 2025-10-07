import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { userId, action, resource, startDate, endDate, success, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }
    
    if (action) {
      query += ` AND action = $${paramCount++}`;
      params.push(action);
    }
    
    if (resource) {
      query += ` AND resource = $${paramCount++}`;
      params.push(resource);
    }
    
    if (startDate) {
      query += ` AND timestamp >= $${paramCount++}`;
      params.push(new Date(startDate as string));
    }
    
    if (endDate) {
      query += ` AND timestamp <= $${paramCount++}`;
      params.push(new Date(endDate as string));
    }
    
    if (success !== undefined) {
      query += ` AND success = $${paramCount++}`;
      params.push(success === 'true');
    }
    
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;
    
    if (userId) {
      countQuery += ` AND user_id = $${countParamCount++}`;
      countParams.push(userId);
    }
    if (action) {
      countQuery += ` AND action = $${countParamCount++}`;
      countParams.push(action);
    }
    if (resource) {
      countQuery += ` AND resource = $${countParamCount++}`;
      countParams.push(resource);
    }
    if (startDate) {
      countQuery += ` AND timestamp >= $${countParamCount++}`;
      countParams.push(new Date(startDate as string));
    }
    if (endDate) {
      countQuery += ` AND timestamp <= $${countParamCount++}`;
      countParams.push(new Date(endDate as string));
    }
    if (success !== undefined) {
      countQuery += ` AND success = $${countParamCount++}`;
      countParams.push(success === 'true');
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: {
        logs: result.rows,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + result.rows.length < total
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getAuditLogById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM audit_logs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit log not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getAuditSummary(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE timestamp BETWEEN $1 AND $2';
      params.push(new Date(startDate as string), new Date(endDate as string));
    }
    
    // Action summary
    const actionQuery = `
      SELECT action, COUNT(*) as count
      FROM audit_logs
      ${dateFilter}
      GROUP BY action
      ORDER BY count DESC
    `;
    const actionResult = await pool.query(actionQuery, params);
    
    // Resource summary
    const resourceQuery = `
      SELECT resource, COUNT(*) as count
      FROM audit_logs
      ${dateFilter}
      GROUP BY resource
      ORDER BY count DESC
    `;
    const resourceResult = await pool.query(resourceQuery, params);
    
    // User activity
    const userQuery = `
      SELECT user_id, COUNT(*) as count
      FROM audit_logs
      ${dateFilter}
      GROUP BY user_id
      ORDER BY count DESC
      LIMIT 10
    `;
    const userResult = await pool.query(userQuery, params);
    
    // Success/failure rates
    const successQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE success = true) as successful,
        COUNT(*) FILTER (WHERE success = false) as failed,
        COUNT(*) as total
      FROM audit_logs
      ${dateFilter}
    `;
    const successResult = await pool.query(successQuery, params);
    
    // Recent failed attempts
    const failedQuery = `
      SELECT *
      FROM audit_logs
      WHERE success = false ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    const failedResult = await pool.query(failedQuery, params);
    
    res.json({
      success: true,
      data: {
        byAction: actionResult.rows,
        byResource: resourceResult.rows,
        topUsers: userResult.rows,
        successRate: {
          successful: parseInt(successResult.rows[0].successful),
          failed: parseInt(successResult.rows[0].failed),
          total: parseInt(successResult.rows[0].total),
          rate: successResult.rows[0].total > 0 
            ? (parseInt(successResult.rows[0].successful) / parseInt(successResult.rows[0].total)) * 100 
            : 0
        },
        recentFailures: failedResult.rows
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getUserActivity(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM audit_logs WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND timestamp >= $${paramCount++}`;
      params.push(new Date(startDate as string));
    }
    
    if (endDate) {
      query += ` AND timestamp <= $${paramCount++}`;
      params.push(new Date(endDate as string));
    }
    
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));
    
    const result = await pool.query(query, params);
    
    // Activity summary
    const summaryQuery = `
      SELECT 
        action,
        COUNT(*) as count,
        MAX(timestamp) as last_activity
      FROM audit_logs
      WHERE user_id = $1
      GROUP BY action
    `;
    const summaryResult = await pool.query(summaryQuery, [userId]);
    
    res.json({
      success: true,
      data: {
        recentActivity: result.rows,
        summary: summaryResult.rows
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getResourceActivity(req: AuthRequest, res: Response) {
  try {
    const { resource, resourceId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM audit_logs WHERE resource = $1';
    const params: any[] = [resource];
    let paramCount = 2;
    
    if (resourceId) {
      query += ` AND resource_id = $${paramCount++}`;
      params.push(resourceId);
    }
    
    if (startDate) {
      query += ` AND timestamp >= $${paramCount++}`;
      params.push(new Date(startDate as string));
    }
    
    if (endDate) {
      query += ` AND timestamp <= $${paramCount++}`;
      params.push(new Date(endDate as string));
    }
    
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));
    
    const result = await pool.query(query, params);
    
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function exportAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'startDate and endDate are required' }
      });
    }
    
    const query = `
      SELECT * FROM audit_logs
      WHERE timestamp BETWEEN $1 AND $2
      ORDER BY timestamp DESC
    `;
    const result = await pool.query(query, [new Date(startDate as string), new Date(endDate as string)]);
    
    if (format === 'csv') {
      const headers = ['ID', 'User ID', 'Action', 'Resource', 'Resource ID', 'Method', 'Path', 
                      'IP Address', 'Timestamp', 'Success', 'Error Message'];
      const rows = result.rows.map(log => [
        log.id,
        log.user_id || '',
        log.action,
        log.resource,
        log.resource_id || '',
        log.method,
        log.path,
        log.ip_address || '',
        log.timestamp.toISOString(),
        log.success ? 'Yes' : 'No',
        log.error_message || ''
      ]);
      
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${startDate}-${endDate}.csv`);
      res.send(csv);
    } else {
      res.json({ success: true, data: result.rows });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
