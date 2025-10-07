/**
 * Compliance Service
 * Handles regulatory compliance, WIOA tracking, and reporting
 * 
 * PRODUCTION NOTE: This service requires a database connection.
 * Configure DATABASE_URL environment variable with PostgreSQL connection string.
 * Run migrations: npm run migrate:compliance
 */

const { Pool } = require('pg');

class ComplianceService {
  constructor() {
    // Initialize database connection pool
    if (!process.env.DATABASE_URL) {
      console.error('WARNING: DATABASE_URL not configured. Compliance data will not persist.');
      console.error('Set DATABASE_URL environment variable to enable database storage.');
      this.db = null;
    } else {
      this.db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    }
  }

  async trackWIOACompliance(programId, data) {
    const record = {
      id: `wioa_${Date.now()}`,
      programId,
      ...data,
      timestamp: new Date(),
      status: 'compliant'
    };

    if (this.db) {
      try {
        await this.db.query(
          `INSERT INTO compliance_reports (id, program_id, data, timestamp, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [record.id, programId, JSON.stringify(data), record.timestamp, record.status]
        );
      } catch (error) {
        console.error('Failed to save compliance record to database:', error);
        throw error;
      }
    } else {
      console.warn('Database not configured - compliance record not persisted');
    }

    return record;
  }

  async generateComplianceReport(programId, startDate, endDate) {
    let records = [];

    if (this.db) {
      try {
        const result = await this.db.query(
          `SELECT * FROM compliance_reports 
           WHERE program_id = $1 
           AND timestamp >= $2 
           AND timestamp <= $3`,
          [programId, startDate, endDate]
        );
        records = result.rows;
      } catch (error) {
        console.error('Failed to fetch compliance records:', error);
        throw error;
      }
    } else {
      console.warn('Database not configured - returning empty report');
    }

    return {
      programId,
      period: { startDate, endDate },
      totalRecords: records.length,
      compliantRecords: records.filter(r => r.status === 'compliant').length,
      nonCompliantRecords: records.filter(r => r.status === 'non-compliant').length,
      complianceRate: this.calculateComplianceRate(records),
      generatedAt: new Date()
    };
  }

  calculateComplianceRate(records) {
    if (records.length === 0) return 100;
    const compliant = records.filter(r => r.status === 'compliant').length;
    return (compliant / records.length) * 100;
  }

  async performAudit(programId) {
    const audit = {
      id: `audit_${Date.now()}`,
      programId,
      performedAt: new Date(),
      findings: [],
      status: 'completed'
    };

    if (this.db) {
      try {
        const result = await this.db.query(
          `SELECT * FROM compliance_reports WHERE program_id = $1`,
          [programId]
        );

        if (result.rows.length === 0) {
          audit.findings.push('No compliance records found');
          audit.status = 'warning';
        }

        await this.db.query(
          `INSERT INTO compliance_audits (id, program_id, performed_at, findings, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [audit.id, programId, audit.performedAt, JSON.stringify(audit.findings), audit.status]
        );
      } catch (error) {
        console.error('Failed to perform audit:', error);
        throw error;
      }
    } else {
      console.warn('Database not configured - audit not persisted');
    }

    return audit;
  }

  async getAuditHistory(programId) {
    if (this.db) {
      try {
        const result = await this.db.query(
          `SELECT * FROM compliance_audits WHERE program_id = $1 ORDER BY performed_at DESC`,
          [programId]
        );
        return result.rows;
      } catch (error) {
        console.error('Failed to fetch audit history:', error);
        throw error;
      }
    } else {
      console.warn('Database not configured - returning empty audit history');
      return [];
    }
  }
}

module.exports = new ComplianceService();
