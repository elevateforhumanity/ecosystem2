import { Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from '../middleware/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function clockIn(req: AuthRequest, res: Response) {
  try {
    const { courseId, sessionId } = req.body;
    const userId = req.user!.id;
    const now = new Date();
    
    const id = `att_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO attendance_records (
        id, user_id, course_id, session_id, attendance_date, clock_in, 
        status, ip_address, total_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, userId, courseId, sessionId, now, now, 'present', req.ip, 0]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function clockOut(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const now = new Date();
    
    const record = await pool.query('SELECT clock_in FROM attendance_records WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attendance record not found' } });
    }
    
    const clockIn = new Date(record.rows[0].clock_in);
    const totalMinutes = Math.floor((now.getTime() - clockIn.getTime()) / 60000);
    
    const result = await pool.query(
      'UPDATE attendance_records SET clock_out = $1, total_minutes = $2 WHERE id = $3 RETURNING *',
      [now, totalMinutes, id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getAttendance(req: AuthRequest, res: Response) {
  try {
    const { userId, courseId } = req.query;
    
    let query = 'SELECT * FROM attendance_records WHERE 1=1';
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
    
    query += ' ORDER BY attendance_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function markAbsent(req: AuthRequest, res: Response) {
  try {
    const { userId, courseId, attendanceDate } = req.body;
    const id = `att_${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO attendance_records (id, user_id, course_id, attendance_date, clock_in, status, total_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, userId, courseId, attendanceDate, attendanceDate, 'absent', 0]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function excuseAbsence(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { excuseReason, excuseDocumentUrl } = req.body;
    
    const result = await pool.query(
      `UPDATE attendance_records SET status = 'excused', excuse_reason = $1, excuse_document_url = $2, verified_by = $3
       WHERE id = $4 RETURNING *`,
      [excuseReason, excuseDocumentUrl, req.user!.id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Attendance record not found' } });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
