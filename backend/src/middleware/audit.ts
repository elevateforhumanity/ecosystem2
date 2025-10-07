import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { AuthRequest } from './auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: any;
  responseStatus?: number;
  changes?: any;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  private sensitiveFields = ['password', 'ssn', 'token', 'secret', 'apiKey'];
  
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    
    for (const key in sanitized) {
      if (this.sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  private extractResourceInfo(path: string, method: string): { resource: string, resourceId?: string } {
    const parts = path.split('/').filter(p => p);
    
    // Remove 'api' prefix if present
    if (parts[0] === 'api') parts.shift();
    
    const resource = parts[0] || 'unknown';
    const resourceId = parts.length > 1 && !['create', 'update', 'delete'].includes(parts[1]) ? parts[1] : undefined;
    
    return { resource, resourceId };
  }
  
  private determineAction(method: string, path: string): string {
    const lowerPath = path.toLowerCase();
    
    if (method === 'POST') {
      if (lowerPath.includes('login')) return 'login';
      if (lowerPath.includes('logout')) return 'logout';
      if (lowerPath.includes('register')) return 'register';
      return 'create';
    }
    if (method === 'PUT' || method === 'PATCH') return 'update';
    if (method === 'DELETE') return 'delete';
    if (method === 'GET') return 'read';
    
    return 'unknown';
  }
  
  async log(logEntry: Partial<AuditLog>): Promise<void> {
    try {
      const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await pool.query(
        `INSERT INTO audit_logs (
          id, user_id, action, resource, resource_id, method, path,
          ip_address, user_agent, request_body, response_status, changes,
          timestamp, success, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13, $14)`,
        [
          id,
          logEntry.userId,
          logEntry.action,
          logEntry.resource,
          logEntry.resourceId,
          logEntry.method,
          logEntry.path,
          logEntry.ipAddress,
          logEntry.userAgent,
          logEntry.requestBody ? JSON.stringify(logEntry.requestBody) : null,
          logEntry.responseStatus,
          logEntry.changes ? JSON.stringify(logEntry.changes) : null,
          logEntry.success !== false,
          logEntry.errorMessage
        ]
      );
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
  
  middleware() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const originalSend = res.send;
      
      let responseBody: any;
      let responseStatus = res.statusCode;
      
      // Capture response
      res.send = function (body: any): Response {
        responseBody = body;
        responseStatus = res.statusCode;
        return originalSend.call(this, body);
      };
      
      // Wait for response to complete
      res.on('finish', async () => {
        try {
          const { resource, resourceId } = this.extractResourceInfo(req.path, req.method);
          const action = this.determineAction(req.method, req.path);
          
          // Skip logging for health checks and static assets
          if (req.path.includes('/health') || req.path.includes('/static')) {
            return;
          }
          
          const logEntry: Partial<AuditLog> = {
            userId: req.user?.id,
            action,
            resource,
            resourceId,
            method: req.method,
            path: req.path,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            requestBody: this.sanitizeData(req.body),
            responseStatus,
            success: responseStatus < 400,
            errorMessage: responseStatus >= 400 ? responseBody : undefined
          };
          
          // For update operations, try to capture changes
          if (action === 'update' && req.body) {
            logEntry.changes = this.sanitizeData(req.body);
          }
          
          await this.log(logEntry);
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      });
      
      next();
    };
  }
  
  // Specific audit methods for important actions
  async logLogin(userId: string, success: boolean, ipAddress?: string, errorMessage?: string): Promise<void> {
    await this.log({
      userId,
      action: 'login',
      resource: 'auth',
      method: 'POST',
      path: '/api/auth/login',
      ipAddress,
      success,
      errorMessage
    });
  }
  
  async logLogout(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: 'logout',
      resource: 'auth',
      method: 'POST',
      path: '/api/auth/logout',
      ipAddress,
      success: true
    });
  }
  
  async logDataAccess(userId: string, resource: string, resourceId: string, action: string): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      method: 'GET',
      path: `/api/${resource}/${resourceId}`,
      success: true
    });
  }
  
  async logDataModification(userId: string, resource: string, resourceId: string, action: string, changes: any): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      method: action === 'create' ? 'POST' : action === 'delete' ? 'DELETE' : 'PUT',
      path: `/api/${resource}/${resourceId}`,
      changes: this.sanitizeData(changes),
      success: true
    });
  }
  
  async logSecurityEvent(userId: string | undefined, event: string, details: any, success: boolean): Promise<void> {
    await this.log({
      userId,
      action: event,
      resource: 'security',
      method: 'POST',
      path: '/security/event',
      requestBody: this.sanitizeData(details),
      success
    });
  }
  
  async logComplianceEvent(userId: string, event: string, resource: string, resourceId: string, details: any): Promise<void> {
    await this.log({
      userId,
      action: event,
      resource,
      resourceId,
      method: 'POST',
      path: `/compliance/${resource}/${resourceId}`,
      requestBody: this.sanitizeData(details),
      success: true
    });
  }
}

export const auditLogger = new AuditLogger();

// Middleware function
export function auditLog() {
  return auditLogger.middleware();
}

// Export specific logging functions
export const logLogin = auditLogger.logLogin.bind(auditLogger);
export const logLogout = auditLogger.logLogout.bind(auditLogger);
export const logDataAccess = auditLogger.logDataAccess.bind(auditLogger);
export const logDataModification = auditLogger.logDataModification.bind(auditLogger);
export const logSecurityEvent = auditLogger.logSecurityEvent.bind(auditLogger);
export const logComplianceEvent = auditLogger.logComplianceEvent.bind(auditLogger);
